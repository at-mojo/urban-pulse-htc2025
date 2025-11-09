import { Ollama } from 'ollama';
// import { getReports } from '../src/report.js'

const ollama = new Ollama({
  host: process.env.OLLAMA_HOST || 'http://10.0.11.2:30068/'
});

const s3bucketUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`;

const titles = [
  'Big hole in the street again',
  'That pothole on 7th is getting worse',
  'Someone should probably fix this road',
  'Huge dip where the pavement used to be',
  'The street’s basically falling apart here',
  'Same pothole, bigger every week',
  'Not sure if this counts as a road anymore',
  'Watch out for this crater on Maple Ave',
  'Another bump spot that’ll kill your tires',
  'This road damage is getting ridiculous',
  'Pretty sure this pothole’s older than my car'
]

console.log(titles.map(r => r).join('\n'))

const res = await ollama.chat({
  model: 'llama3.2-vision',
  messages: [{
     'role': 'user', 
     'content': `
        Normalize the following related user-given report tiles into one concise title 
        describing the urban issue. Include any identifying details like location in the title. Do
        not include any colloquiallisms. Do not put placeholders for specific location. 
        Respond only with the title:
        ${titles.map((r) => r).join('\n')}
     `
  }]
})

console.log(res.message.content)