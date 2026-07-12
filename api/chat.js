export default async function handler(req, res) {

    // Hanya menerima POST
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method Not Allowed"
        });
    }

    try {

        const API_KEY = process.env.OPENROUTER_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({
                error: "OPENROUTER_API_KEY belum diset."
            });
        }

        const {
            messages = []
        } = req.body;

        if (!Array.isArray(messages)) {
            return res.status(400).json({
                error: "Format messages tidak valid."
            });
        }

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",

                    // Disarankan OpenRouter
                    "HTTP-Referer":
                        process.env.APP_URL ||
                        "http://localhost:3000",

                    "X-Title":
                        "Scorpio AI"
                },

                body: JSON.stringify({

                    model:
                        process.env.OPENROUTER_MODEL ||
                        "deepseek/deepseek-chat-v3-0324:free",

                    messages: [

                        {
                            role: "system",
                            content:
`Kamu adalah Scorpio AI.

Scorpio AI adalah AI resmi OQLine Technology.

Karakter:
- Profesional
- Cepat
- Tajam
- Akurat
- Ramah
- Menjawab dalam Bahasa Indonesia kecuali diminta menggunakan bahasa lain.

Jika tidak mengetahui jawaban, katakan dengan jujur dan jangan mengarang.`
                        },

                        ...messages

                    ],

                    temperature: 0.7,

                    max_tokens: 1200

                })

            }
        );

        const data = await response.json();

        if (!response.ok) {

            console.error("OPENROUTER ERROR");
            console.error(data);

            return res.status(response.status).json({
                error:
                    data.error?.message ||
                    JSON.stringify(data)
            });

        }

        const reply =
            data?.choices?.[0]?.message?.content ||
            "Maaf, saya tidak dapat memberikan jawaban.";

        return res.status(200).json({

            reply

        });

    }

    catch (err) {

        console.error(err);

        return res.status(500).json({

            error: err.message

        });

    }

}
