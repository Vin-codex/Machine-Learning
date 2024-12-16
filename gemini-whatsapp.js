import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

// Setup Gemini AI
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Setup WhatsApp Client
const client = new Client();

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Customer Service Bot is ready!');
});

client.on('message', async msg => {
    console.log('Message Received: ', msg.body);
    if (msg.body.toLowerCase().includes('hello') || msg.body.toLowerCase().includes('halo') || msg.body.toLowerCase().includes('hi')) {
        msg.reply('Hi There! Is there anything I can help you with today?');
    } else if (msg.body.startsWith('!Snap ')) {
        const query = msg.body.slice(7);

        // Prompt
        const prompt = `
        You are a human resource admin in a company called TestCompany, which works in the field of IT solution.
        You answer in 1 paragraph with proper English grammar.
        Don't answer things that you don't know, redirect the customer to email the HR department hr.admin@testcompany.id for more information.

        Question: ${query}
        Answer:
        `;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            msg.reply(`${text}`);
        } catch (error) {
            console.error('Error with Gemini API:', error);
            msg.reply('Sorry for the inconvinience, we are currently unable to answer your questions. Please contact hr.admin@testcompany.id');
        }
    } else if (msg.body.toLowerCase().includes('!limit')) {
        msg.reply('Sorry, I am only able to answer questions regarding Human Resource problem. Please contact hr.admin@testcompany.id for more information');
    } else if (msg.body.toLowerCase().includes('!recommendation')) {
        msg.reply('You may ask me questions regarding Reimbursement, Leave, and etc. So which topic may I help you with today?');
    } else {
        msg.reply('Hi! Please use the `!Snap [question]` command to ask, or `!limit` to see my service limitations.');
    }
});

client.initialize();
