"use server";
import { Ollama } from "ollama";
import OpenAI from "openai";

// const ollama = new Ollama({
//   host: process.env.OLLAMA_HOST,
//   headers: {
//     Authorization: "Bearer " + process.env.OLLAMA_API_KEY,
//   },
// });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE_URL,
});

const s3bucketUrl = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com`;

async function getImageBase64FromUrl(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image, status: ${response.status}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

export async function generateDescription(data: {
  imagePath: string;
}): Promise<{ content: string }> {
  try {
    // const image = await getImageBase64FromUrl(`${s3bucketUrl}/${data.imagePath}`);
    console.log("Generating description for image at path:", data.imagePath);
    const res = await client.chat.completions.create({
      model: "meta-llama/llama-3.2-11b-vision-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a passerby reporting an urban issue. Analyze the image and describe any visible 
            problems related to urban infrastructure, such as potholes, damaged sidewalks, graffiti, or littering. 
            Briefly describe only the issue in the image; do not suggest solutions or actions to take. Limit your
            description to one or two sentences. ALWAYS Assume first-person perspective. Do not narrate, 
            only write the description. Speak very concisely and to the point and casually. Do not use any emojis.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `${s3bucketUrl}/${data.imagePath}`,
              },
            },
          ],
        },
      ],
    });

    console.log(res.choices[0]?.message?.content);
    return { content: res.choices[0]?.message?.content || "" };
  } catch (error) {
    console.error("Error generating description:", error);
    throw new Error("Internal Server Error");
  }
}

// export async function compareReports(data: {
//   report1: { title: string; description: string },
//   report2: { title: string; description: string }
// }): Promise<{ content: string }> {
//   try {
//     const res = await ollama.chat({
//       model: 'llama3.2-vision',
//       messages: [{
//         'role': 'user',
//         'content': `
//           Compare the two following titles and descriptions of an urban issue. On a scale from 0 to 1, where 0 means not the same issue and 1 means the same issue,
//           score on how confident you are that these two descriptions are of the same issue. The title should be weighted much less as it is prone to human error.
//           Assume the location is the same area. Limit your response to a single decimal number. Do not provide any reasoning or explanation, just the number.

//           Title 1: ${data.report1.title}
//           Description 1: ${data.report1.description}

//           Title 2: ${data.report2.title}
//           Description 2: ${data.report2.description}`,
//       }]
//     });

//     return  { content: res.message.content };
//   } catch (error) {
//     console.error("Error comparing reports:", error);
//     throw new Error("Internal Server Error");
//   }
// }

// const MAX_TITLES = 10; // Limit max titles to avoid prompt from eating shit
// const MAX_DESCRIPTIONS = 10; // This too, should probably just grab highest rated descriptions, but oh well

// async function normalizeTitles(titles: string[]): Promise<string> {
//   let prompt = `
//     Normalize the following related user-given report tiles into one concise title
//     describing the urban issue. Include any identifying details like location in the title. Do
//     not include any colloquiallisms. Do not put placeholders for specific location.
//     Respond only with the title:

//   `

//   for (let i = 0; i < MAX_TITLES; i++) {
//     prompt += `${titles[i]}\n`;
//   }

//   try {
//     const res = await ollama.chat({
//       model: 'llama3.2-vision',
//       messages: [{
//         'role': 'user',
//         'content': prompt
//       }]
//     })

//     return res.message.content;
//   } catch (error) {
//     console.error("Error generating title:", error);
//     throw new Error("Internal Server Error");
//   }
// }

// async function generateDescriptionFromDescriptions(descriptions: string[]): Promise<string> {
//   try {
//     const res = await ollama.chat({
//       model: 'llama3.2-vision',
//       messages: [{
//         'role': 'user',
//         'content': `
//             Normalize the following related descriptions into one description
//             describing the urban issue. Include any identifying details like location in the title. Do
//             not include any colloquiallisms. Do not put placeholders for specific location.
//             Respond only with the title:
//             ${descriptions.map((r) => r).join('\n')}
//         `
//       }]
//     })

//     return res.message.content;
//   } catch (error) {
//     console.error("Error generating title:", error);
//     throw new Error("Internal Server Error");
//   }
// }

// export async function generateRelationData(data: {
//   titles: string[], descriptions: string[]
// }): Promise<{ content: { title: string, description: string } }> {
//   try {
//     const title = await normalizeTitles(data.titles);
//     // const description =

//     return { content: {
//       title: title,
//       description: ''
//     }}
//   } catch (error) {
//     console.error("Error generating relation data:", error);
//     throw new Error("Internal Server Error");
//   }
// }
