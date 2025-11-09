import { Ollama } from 'ollama';

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST
});

async function getImageBase64FromUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image, status: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString('base64');
}

export async function generateDescription(data: { imageUrl: string }): Promise<Response> {
  try {
    const image = await getImageBase64FromUrl(data.imageUrl);
  
    const res = await ollama.chat({
      model: 'llama3.2-vision',
      messages: [{
        'role': 'user',
        'content': `You are a passerby reporting an urban issue. Analyze the image and describe any visible 
                    problems related to urban infrastructure, such as potholes, damaged sidewalks, graffiti, or littering. 
                    Briefly describe only the issue in the image; do not suggest solutions or actions to take. Limit your
                    description to one or two sentences. Assume first-person perspective.`,
        'images': [image]
      }]
    });
  
    return new Response(res.message.content, { status: 200 });
  } catch (error) {
    console.error("Error generating description:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export async function compareDescriptions(data: { description1: string; description2: string }): Promise<Response> {
  try {
    const res = await ollama.chat({
      model: 'llama3.2-vision',
      messages: [{
        'role': 'user',
        'content': `Compare the two following descriptions of an urban issue. On a scale from 0 to 1, where 0 means not the same issue and 1 means the same issue,
                    score on how confident you are that these two descriptions are of the same issue. Assume the location is about the same area. Limit your response to
                    a single decimal number. Do not provide any reasoning or explanation, just the number.
                    
                    Description 1: ${data.description1}
                    Description 2: ${data.description2}`,
      }]
    });

    return new Response(res.message.content, { status: 200 });
  } catch (error) {
    console.error("Error comparing descriptions:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
