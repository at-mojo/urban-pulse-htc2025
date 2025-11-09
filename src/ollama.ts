import { Ollama } from 'ollama';

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST
});

const s3bucketUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

async function getImageBase64FromUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image, status: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

export async function generateDescription(data: { imagePath: string }) : Promise<{ content: string }> {
  try {
    const image = await getImageBase64FromUrl(`${s3bucketUrl}/${data.imagePath}`);
  
    const res = await ollama.chat({
      model: 'llama3.2-vision',
      messages: [{
        'role': 'user',
        'content': `
          You are a passerby reporting an urban issue. Analyze the image and describe any visible 
          problems related to urban infrastructure, such as potholes, damaged sidewalks, graffiti, or littering. 
          Briefly describe only the issue in the image; do not suggest solutions or actions to take. Limit your
          description to one or two sentences. Assume first-person perspective.`,
        'images': [image]
      }]
    });

    return { content: res.message.content };
  } catch (error) {
    console.error("Error generating description:", error);
    throw new Error("Internal Server Error");
  }
}

export async function compareReports(data: { 
  report1: { title: string; description: string }, 
  report2: { title: string; description: string } 
}): Promise<{ content: string }> {
  try {
    const res = await ollama.chat({
      model: 'llama3.2-vision',
      messages: [{
        'role': 'user',
        'content': `
          Compare the two following titles and descriptions of an urban issue. On a scale from 0 to 1, where 0 means not the same issue and 1 means the same issue,
          score on how confident you are that these two descriptions are of the same issue. The title should be weighted much less as it is prone to human error. 
          Assume the location is the same area. Limit your response to a single decimal number. Do not provide any reasoning or explanation, just the number.
          
          Title 1: ${data.report1.title}
          Description 1: ${data.report1.description}

          Title 2: ${data.report2.title}
          Description 2: ${data.report2.description}`,
      }]
    });

    return  { content: res.message.content };
  } catch (error) {
    console.error("Error comparing reports:", error);
    throw new Error("Internal Server Error");
  }
}
