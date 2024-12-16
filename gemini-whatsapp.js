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
    console.log('Pesan Diterima: ', msg.body);
    if (msg.body.toLowerCase().includes('halo') || msg.body.toLowerCase().includes('hallo')) {
        msg.reply('Halo Kak! Ada yang bisa Kakak tanyakan mengenai program Microcredential Bisnis Digital, Inovasi, dan Kewirausahaan?');
    } else if (msg.body.startsWith('!tanya ')) {
        const query = msg.body.slice(7);

        // Prompt
        const prompt = `
        Kamu adalah customer service program Microcredential Bisnis Digital, Inovasi, dan Kewirausahaan. 
        Kamu menjawab dalam 1 paragraf dengan bahasa Indonesia yang sopan dan ramah tanpa emoticon. 
        Jangan jawab hal yang tidak kamu ketahui, dan arahkan ke team@microcredential.id jika diperlukan.

        Pertanyaan: ${query}
        Jawaban:
        `;

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            msg.reply(`*Customer Service AI*\n${text}`);
        } catch (error) {
            console.error('Error with Gemini API:', error);
            msg.reply('Maaf Kak, terjadi kesalahan. Silakan coba lagi atau hubungi team@microcredential.id.');
        }
    } else if (msg.body.toLowerCase().includes('!batasan')) {
        msg.reply('Mohon maaf Kak, saya hanya bisa menjawab terkait program Microcredential. Untuk kendala lain, silakan hubungi team@microcredential.id.');
    } else if (msg.body.toLowerCase().includes('!rekomendasi')) {
        msg.reply('Kakak ingin mengambil mata kuliah untuk profesi apa? Dan berapa jumlah maksimal mata kuliah yang bisa diambil?');
    } else {
        msg.reply('Halo Kak! Mohon gunakan perintah `!tanya [pertanyaan]` untuk bertanya, atau `!batasan` untuk batasan layanan saya.');
    }
});

client.initialize();
