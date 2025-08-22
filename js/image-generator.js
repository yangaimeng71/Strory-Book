// AI图片生成模块
class ImageGenerator {
    constructor() {
        this.useRealAPI = false; // 可以通过设置面板控制
        this.apiEndpoint = '/api/generate-image'; // 实际API端点
    }

    async generateStoryImages(story) {
        const images = [];
        
        for (let i = 0; i < story.paragraphs.length; i++) {
            try {
                const imageUrl = await this.generateSingleImage(
                    story.paragraphs[i], 
                    story.title, 
                    i
                );
                images.push(imageUrl);
            } catch (error) {
                console.error(`生成第${i + 1}张插画失败:`, error);
                // 使用备用图片
                images.push(this.getFallbackImage(i));
            }
        }
        
        return images;
    }

    async generateSingleImage(paragraph, storyTitle, pageIndex) {
        if (this.useRealAPI) {
            return await this.callRealImageAPI(paragraph, storyTitle, pageIndex);
        } else {
            return await this.getMockImage(paragraph, pageIndex);
        }
    }

    async callRealImageAPI(paragraph, storyTitle, pageIndex) {
        const prompt = this.createChildFriendlyPrompt(paragraph, storyTitle);
        
        try {
            // 这里是真实的API调用 - 需要用户确认是否启用
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: prompt,
                    model: 'imagen3', // 或其他适合的模型
                    aspect_ratio: '4:3',
                    task_summary: `为儿童绘本《${storyTitle}》第${pageIndex + 1}页生成插画`
                })
            });

            if (!response.ok) {
                throw new Error(`API请求失败: ${response.status}`);
            }

            const result = await response.json();
            return result.image_url || result.url;
            
        } catch (error) {
            console.error('真实API调用失败:', error);
            throw error;
        }
    }

    async getMockImage(paragraph, pageIndex) {
        // 模拟生成延迟
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // 基于段落内容选择合适的mock图片
        const imageCategories = this.categorizeContent(paragraph);
        return this.getThematicImage(imageCategories, pageIndex);
    }

    categorizeContent(paragraph) {
        const categories = [];
        
        // 动物相关
        if (/兔子|小兔|松鼠|小鹿|狐狸|小熊|猴子/.test(paragraph)) {
            categories.push('animals');
        }
        
        // 自然场景
        if (/森林|树木|花朵|山洞|河流|草地/.test(paragraph)) {
            categories.push('nature');
        }
        
        // 魔法相关
        if (/魔法|宝石|光芒|巫师|神奇/.test(paragraph)) {
            categories.push('magic');
        }
        
        // 冒险相关
        if (/冒险|旅程|寻找|探险|勇敢/.test(paragraph)) {
            categories.push('adventure');
        }
        
        // 友谊相关
        if (/朋友|友谊|帮助|一起|分享/.test(paragraph)) {
            categories.push('friendship');
        }
        
        return categories.length > 0 ? categories : ['general'];
    }

    getThematicImage(categories, pageIndex) {
        const imageCollections = {
            animals: [
                'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&h=300&fit=crop', // 兔子
                'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=400&h=300&fit=crop', // 松鼠
                'https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=400&h=300&fit=crop', // 鹿
                'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=400&h=300&fit=crop', // 狐狸
            ],
            nature: [
                'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop', // 森林
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', // 山景
                'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=400&h=300&fit=crop', // 花朵
                'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop', // 湖泊
            ],
            magic: [
                'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop', // 魔法感觉
                'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop', // 星空
                'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=400&h=300&fit=crop', // 彩虹
            ],
            adventure: [
                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', // 山峰
                'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop', // 小径
                'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=400&h=300&fit=crop', // 探险
            ],
            friendship: [
                'https://images.unsplash.com/photo-1523800503107-5bc3ba2a6f81?w=400&h=300&fit=crop', // 温馨
                'https://images.unsplash.com/photo-1543699936-c901edd954a4?w=400&h=300&fit=crop', // 友爱
            ],
            general: [
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=400&h=300&fit=crop',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
            ]
        };

        // 根据内容类别选择合适的图片
        for (const category of categories) {
            if (imageCollections[category]) {
                const images = imageCollections[category];
                return images[pageIndex % images.length];
            }
        }

        // 默认图片
        const defaultImages = imageCollections.general;
        return defaultImages[pageIndex % defaultImages.length];
    }

    createChildFriendlyPrompt(paragraph, storyTitle) {
        // 创建适合儿童的图片提示词
        const baseStyle = "Children's book illustration, cute cartoon style, soft watercolor painting, bright warm colors, child-friendly, safe content, no scary elements, ";
        
        // 提取关键元素
        const keyElements = this.extractKeyElements(paragraph);
        
        // 构建完整提示词
        let prompt = baseStyle;
        
        if (keyElements.characters.length > 0) {
            prompt += `featuring ${keyElements.characters.join(', ')}, `;
        }
        
        if (keyElements.setting) {
            prompt += `in a ${keyElements.setting}, `;
        }
        
        if (keyElements.mood) {
            prompt += `${keyElements.mood} atmosphere, `;
        }
        
        prompt += "storybook art style, digital illustration, high quality";
        
        return prompt;
    }

    extractKeyElements(paragraph) {
        const elements = {
            characters: [],
            setting: null,
            mood: null
        };

        // 提取角色
        const characterPatterns = [
            { pattern: /小兔子|兔子/, name: 'cute little rabbit' },
            { pattern: /小松鼠|松鼠/, name: 'cute squirrel' },
            { pattern: /小鹿/, name: 'gentle deer' },
            { pattern: /小狐狸|狐狸/, name: 'friendly fox' },
            { pattern: /小熊/, name: 'cuddly bear cub' },
            { pattern: /猴子/, name: 'playful monkey' },
            { pattern: /小女孩|女孩/, name: 'little girl' },
            { pattern: /小朋友/, name: 'child' }
        ];

        characterPatterns.forEach(({pattern, name}) => {
            if (pattern.test(paragraph)) {
                elements.characters.push(name);
            }
        });

        // 提取场景
        const settingPatterns = [
            { pattern: /森林/, name: 'magical forest' },
            { pattern: /山洞/, name: 'cozy cave' },
            { pattern: /草地/, name: 'sunny meadow' },
            { pattern: /花园/, name: 'beautiful garden' },
            { pattern: /河边|河流/, name: 'peaceful riverside' },
            { pattern: /家/, name: 'warm home' }
        ];

        for (const {pattern, name} of settingPatterns) {
            if (pattern.test(paragraph)) {
                elements.setting = name;
                break;
            }
        }

        // 提取情绪氛围
        const moodPatterns = [
            { pattern: /快乐|开心|高兴/, mood: 'joyful and happy' },
            { pattern: /勇敢|勇气/, mood: 'brave and determined' },
            { pattern: /温暖|温馨/, mood: 'warm and cozy' },
            { pattern: /神奇|魔法/, mood: 'magical and wonder-filled' },
            { pattern: /友谊|朋友/, mood: 'friendly and heartwarming' },
            { pattern: /冒险|探险/, mood: 'adventurous and exciting' }
        ];

        for (const {pattern, mood} of moodPatterns) {
            if (pattern.test(paragraph)) {
                elements.mood = mood;
                break;
            }
        }

        return elements;
    }

    getFallbackImage(pageIndex) {
        // 备用图片列表
        const fallbackImages = [
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1529655683826-aba9b3e77383?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
        ];
        
        return fallbackImages[pageIndex % fallbackImages.length];
    }

    // 启用真实API的方法
    enableRealAPI(endpoint = null) {
        this.useRealAPI = true;
        if (endpoint) {
            this.apiEndpoint = endpoint;
        }
        console.log('已启用真实AI图片生成API');
    }

    // 禁用真实API，使用模拟图片
    disableRealAPI() {
        this.useRealAPI = false;
        console.log('已切换到模拟图片模式');
    }
}

// 导出供主应用使用
window.ImageGenerator = ImageGenerator;