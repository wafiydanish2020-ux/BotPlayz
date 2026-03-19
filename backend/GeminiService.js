const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
    constructor() {
        // Kita pakai Gemini 1.5 Pro biar bisa nulis kode dan kreatif!
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        this.chat = this.model.startChat({
            history: [], // History akan di-inject dari frontend
            generationConfig: {
                temperature: 0.9, // Biar lebih kreatif dan ga kaku
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2000,
            },
            // >>> INI KEPRIBADIAN BOTPLAYZ! <<<
            systemInstruction: `
                Kamu adalah BotPlayz, AI canggih yang diciptakan oleh AzrulPlayz.
                Fokus utamamu adalah membantu pengguna seputar koding, addon Minecraft (bisa buatan sendiri!), texture pack, shader, dan semua hal yang berhubungan dengan Minecraft di Indonesia.
                
                Ketika ditanya "siapa penciptamu?", jawab dengan: "Aku diciptakan oleh AzrulPlayz, otak di balik semua ini!"
                
                Gaya bicaramu harus semangat, agak gaul, friendly, dan antusias. Jangan kaku.
                
                Jika ada yang bertanya tentang addon Minecraft buatanmu, berikan contoh singkat file MCADDON atau JSON.
                Contoh:
                - Kalau user minta addon pedang laser, kamu bisa kasih JSON komponennya.
                - Kalau user minta addon mob baru, kamu bisa kasih contoh script perilaku sederhana.
                
                Sebutkan YouTuber Minecraft Indonesia favoritmu (seperti Frost Diamond, BeaconCream, Erpan1140, The Dream Craft) dan rekomendasi video anak bangsa yang inspiratif atau seru.
                
                Selalu siap memberikan kode, saran koding, atau ide addon kreatif. Tampilkan antusiasmemu terhadap Minecraft dan koding!
            `
        });
    }

    async generateResponse(message, history, fileData = null) {
        // History dari frontend akan di-update di setiap request
        this.chat.setHistory(JSON.parse(history || "[]"));

        let payload = [{ text: message }];

        if (fileData) {
            payload.push({
                inlineData: {
                    data: fileData.buffer.toString("base64"),
                    mimeType: fileData.mimetype
                }
            });
        }

        try {
            const result = await this.chat.sendMessage(payload);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("Gemini Error:", error);
            throw new Error("BotPlayz lagi nge-bug, coba lagi ya!");
        }
    }

    // Fungsi tambahan buat ngasih contoh addon MCADDON/JSON
    getExampleAddonFile(addonType) {
        if (addonType === 'laser_sword') {
            return `
\`\`\`json
{
    "format_version": "1.16.0",
    "minecraft:item": {
        "description": {
            "identifier": "botplayz:laser_sword",
            "category": "equipment"
        },
        "components": {
            "minecraft:max_stack_size": 1,
            "minecraft:hand_equipped": true,
            "minecraft:durability": {
                "max_durability": 500
            },
            "minecraft:attack_damage": {
                "value": 15
            },
            "minecraft:enchantable": {
                "value": 10,
                "slot": "sword"
            },
            "minecraft:display_name": {
                "value": "§bPedang Laser BotPlayz"
            },
            "minecraft:creative_category": {
                "parent": "itemGroup.name.sword"
            }
        }
    }
}
\`\`\`
Ini contoh file JSON untuk behavior pack pedang laser. Tinggal kamu taruh di folder \`BP/items/laser_sword.json\` di Minecraft Bedrock kamu, bro! 🔥`;
        } else if (addonType === 'custom_ore') {
            return `
\`\`\`json
{
    "format_version": "1.16.0",
    "minecraft:block": {
        "description": {
            "identifier": "botplayz:ruby_ore",
            "properties": {
                "botplayz:p_color": [0,1,2]
            }
        },
        "components": {
            "minecraft:material_instances": {
                "*": {
                    "texture": "ruby_ore",
                    "render_method": "opaque"
                }
            },
            "minecraft:map_color": "#FF0000",
            "minecraft:destroy_time": 3,
            "minecraft:explosion_resistance": 3,
            "minecraft:friction": 0.6,
            "minecraft:flammable": {
                "flame_odds": 0,
                "burn_odds": 0
            },
            "minecraft:loot": "loot_tables/blocks/ruby_ore.json"
        },
        "events": {
            "break_item": {
                "set_block_property": { "botplayz:p_color": 0 }
            }
        }
    }
}
\`\`\`
Ini contoh JSON buat custom Ruby Ore! Jangan lupa tambahin juga file texturenya di folder \`RP/textures/blocks/\` ya! Seru kan? ⛏️`;
        }
        return "Aku belum punya contoh addon itu, tapi kamu bisa minta ide ke aku!";
    }
}

module.exports = new GeminiService();
