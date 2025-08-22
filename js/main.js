class StoryApp {
    constructor() {
        this.currentStory = null;
        this.currentPageIndex = 0;
        this.isPlaying = false;
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.highlightTimeout = null;
        this.imageGenerator = new ImageGenerator();
        
        this.init();
    }

    init() {
        this.loadSettings();
        this.bindEvents();
        this.showPage('homePage');
    }

    bindEvents() {
        // 首页事件
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateStory();
        });

        document.getElementById('storyInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateStory();
            }
        });

        // 主题标签点击
        document.querySelectorAll('.theme-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const theme = tag.dataset.theme;
                document.getElementById('storyInput').value = theme;
                this.generateStory();
            });
        });

        // 设置面板事件
        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
        });

        document.getElementById('closeSettingsBtn').addEventListener('click', () => {
            this.hideSettings();
        });

        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.saveSettings();
        });

        // 点击模态框外部关闭
        document.getElementById('settingsModal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('settingsModal')) {
                this.hideSettings();
            }
        });

        // 故事页面事件
        document.getElementById('backBtn').addEventListener('click', () => {
            this.goHome();
        });

        document.getElementById('prevBtn').addEventListener('click', () => {
            this.previousPage();
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            this.nextPage();
        });

        document.getElementById('playBtn').addEventListener('click', () => {
            this.togglePlayback();
        });

        document.getElementById('speedSelect').addEventListener('change', () => {
            this.stopPlayback();
        });

        // 结束页面事件
        document.getElementById('newStoryBtn').addEventListener('click', () => {
            this.goHome();
        });

        document.getElementById('saveStoryBtn').addEventListener('click', () => {
            this.saveStory();
        });

        document.getElementById('shareStoryBtn').addEventListener('click', () => {
            this.shareStory();
        });
    }

    async generateStory() {
        const input = document.getElementById('storyInput').value.trim();
        if (!input) {
            this.showToast('请输入故事主题或选择一个预设主题');
            return;
        }

        this.showPage('loadingPage');
        this.animateLoadingSteps();

        try {
            // 模拟AI生成故事
            const story = await this.createStory(input);
            this.currentStory = story;
            this.currentPageIndex = 0;

            // 生成插画
            await this.generateImages(story);

            this.showStoryPage();
        } catch (error) {
            console.error('生成故事失败:', error);
            this.showToast('故事生成失败，请重试');
            this.showPage('homePage');
        }
    }

    async createStory(theme) {
        // 根据主题生成故事内容
        const storyTemplates = {
            '勇敢的小动物': {
                title: '勇敢的小兔子贝贝',
                paragraphs: [
                    '在一片美丽的森林里，住着一只名叫贝贝的小兔子。贝贝有着雪白的毛发和红宝石般的眼睛，但她总是很胆小，不敢独自出门探险。',
                    '一天，森林里传来了求救声。原来是小松鼠奇奇掉进了深深的山洞里，大家都不知道该怎么办。动物们围在洞口，焦急地讨论着救援方案。',
                    '贝贝看到大家都很着急，心里也很难过。虽然她很害怕，但她想起了妈妈说过的话："真正的勇敢不是不害怕，而是即使害怕也要去帮助别人。"',
                    '贝贝深深吸了一口气，勇敢地跳进了山洞。洞里很黑，她的心怦怦直跳，但她想着奇奇需要帮助，就一步一步小心地往下走。',
                    '终于，贝贝找到了受伤的奇奇。她温柔地安慰奇奇，然后背着他慢慢爬出了山洞。当大家看到贝贝安全地救出奇奇时，都为她鼓掌喝彩。',
                    '从那天起，贝贝再也不是那只胆小的小兔子了。她学会了勇敢，也明白了帮助别人会让自己变得更加强大和快乐。'
                ]
            },
            '神奇的森林': {
                title: '神奇森林的秘密',
                paragraphs: [
                    '在遥远的地方有一片神奇的森林，这里的树木会发光，花朵会唱歌，蝴蝶的翅膀像彩虹一样绚烂。小女孩莉莉偶然发现了这个奇妙的地方。',
                    '莉莉走进森林，看到一只会说话的小鹿。小鹿告诉她，这片森林正面临危险，邪恶的巫师想要夺走森林的魔法，让所有美好的东西都消失。',
                    '善良的莉莉决定帮助森林。小鹿带她去见智慧的老树爷爷，老树爷爷告诉她，只有找到三颗魔法宝石，才能保护森林不被破坏。',
                    '莉莉开始了寻宝之旅。她帮助迷路的小鸟找到家，获得了蓝色的友善宝石；她救助了受伤的小狐狸，得到了红色的爱心宝石。',
                    '最后一颗绿色的勇气宝石藏在最危险的地方。莉莉虽然害怕，但想到森林里的朋友们，她鼓起勇气，成功取得了宝石。',
                    '三颗宝石聚集在一起，发出耀眼的光芒，驱走了邪恶的巫师。森林恢复了往日的美丽，所有的动物都感谢莉莉的勇敢和善良。'
                ]
            },
            '友谊的力量': {
                title: '最好的朋友',
                paragraphs: [
                    '小熊波波和小兔跳跳是最好的朋友。他们一起玩耍，一起学习，一起分享所有的快乐时光。森林里的其他小动物都羡慕他们深厚的友谊。',
                    '有一天，森林里来了一只新的小猴子叫皮皮。皮皮很聪明，会很多有趣的游戏，波波很快就被吸引了，开始和皮皮一起玩耍。',
                    '跳跳看到波波和皮皮玩得很开心，心里有些难过和嫉妒。她觉得波波不再喜欢和她玩了，于是开始疏远波波，甚至对皮皮也不太友好。',
                    '波波注意到跳跳的变化，心里很困惑也很难过。他找到跳跳，诚恳地说："跳跳，你是我最好的朋友，这永远不会改变。我希望我们都能和皮皮做朋友。"',
                    '跳跳听了波波的话，意识到自己错了。她主动找到皮皮道歉，还邀请皮皮一起加入他们的游戏。三个小动物很快就成为了好朋友。',
                    '从那以后，波波、跳跳和皮皮成为了最好的三人组。他们明白了真正的友谊不是独占，而是分享；不是嫉妒，而是包容和理解。'
                ]
            }
        };

        // 默认故事模板
        let story = storyTemplates[theme] || this.generateCustomStory(theme);
        
        // 模拟生成延迟
        await this.delay(2000);
        
        return story;
    }

    generateCustomStory(theme) {
        const titles = [
            `${theme}的奇妙冒险`,
            `关于${theme}的故事`,
            `${theme}与魔法森林`,
            `小小${theme}成长记`
        ];

        const paragraphs = [
            `从前，在一个美丽的地方，有一个关于${theme}的奇妙故事。主人公是一个善良勇敢的小朋友，他即将开始一段难忘的旅程。`,
            `这个小朋友对${theme}充满了好奇心。有一天，他决定走出舒适的家，去探索这个充满奇迹的世界，寻找属于自己的答案。`,
            `在旅途中，小朋友遇到了各种有趣的朋友和挑战。每一次经历都让他学到了新的知识，也让他变得更加勇敢和智慧。`,
            `通过与${theme}相关的种种冒险，小朋友不仅帮助了许多需要帮助的人，也发现了自己内心深处的力量和价值。`,
            `最终，小朋友明白了${theme}的真正意义。他带着满满的收获和美好的回忆回到了家，但他的心已经变得更加宽广和温暖。`,
            `这个关于${theme}的故事告诉我们，每个人都有自己独特的价值，只要保持善良的心和勇敢的精神，就能创造属于自己的精彩人生。`
        ];

        return {
            title: titles[Math.floor(Math.random() * titles.length)],
            paragraphs
        };
    }

    async generateImages(story) {
        try {
            story.images = await this.imageGenerator.generateStoryImages(story);
        } catch (error) {
            console.error('生成故事插画失败:', error);
            // 使用备用方案
            story.images = story.paragraphs.map((_, index) => 
                this.imageGenerator.getFallbackImage(index)
            );
        }
    }



    animateLoadingSteps() {
        const steps = ['step1', 'step2', 'step3'];
        let currentStep = 0;

        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                document.getElementById(steps[currentStep]).classList.add('active');
                currentStep++;
            } else {
                clearInterval(interval);
            }
        }, 800);
    }

    showStoryPage() {
        this.showPage('storyPage');
        this.updateStoryDisplay();
    }

    updateStoryDisplay() {
        if (!this.currentStory) return;

        document.getElementById('storyTitle').textContent = this.currentStory.title;
        document.getElementById('currentPage').textContent = this.currentPageIndex + 1;
        document.getElementById('totalPages').textContent = this.currentStory.paragraphs.length;
        
        // 更新段落内容
        document.getElementById('storyParagraph').textContent = this.currentStory.paragraphs[this.currentPageIndex];
        
        // 更新图片
        this.updateStoryImage();
        
        // 更新导航按钮状态
        document.getElementById('prevBtn').disabled = this.currentPageIndex === 0;
        document.getElementById('nextBtn').textContent = this.currentPageIndex === this.currentStory.paragraphs.length - 1 ? '结束' : '下一页';
        
        // 停止当前播放
        this.stopPlayback();
    }

    updateStoryImage() {
        const img = document.getElementById('storyImg');
        const loading = document.getElementById('imageLoading');
        
        if (this.currentStory.images && this.currentStory.images[this.currentPageIndex]) {
            loading.style.display = 'flex';
            img.style.display = 'none';
            
            img.onload = () => {
                loading.style.display = 'none';
                img.style.display = 'block';
            };
            
            img.src = this.currentStory.images[this.currentPageIndex];
        }
    }

    previousPage() {
        if (this.currentPageIndex > 0) {
            this.currentPageIndex--;
            this.updateStoryDisplay();
        }
    }

    nextPage() {
        if (this.currentPageIndex < this.currentStory.paragraphs.length - 1) {
            this.currentPageIndex++;
            this.updateStoryDisplay();
        } else {
            // 到达最后一页，显示结束页面
            this.showPage('endPage');
        }
    }

    togglePlayback() {
        if (this.isPlaying) {
            this.stopPlayback();
        } else {
            this.startPlayback();
        }
    }

    startPlayback() {
        if (!this.currentStory || !this.speechSynthesis) return;

        const text = this.currentStory.paragraphs[this.currentPageIndex];
        const speed = parseFloat(document.getElementById('speedSelect').value);

        this.currentUtterance = new SpeechSynthesisUtterance(text);
        this.currentUtterance.rate = speed;
        this.currentUtterance.pitch = 1.1;
        this.currentUtterance.volume = 1;

        // 设置中文语音（如果可用）
        const voices = this.speechSynthesis.getVoices();
        const chineseVoice = voices.find(voice => voice.lang.includes('zh') || voice.lang.includes('CN'));
        if (chineseVoice) {
            this.currentUtterance.voice = chineseVoice;
        }

        this.currentUtterance.onstart = () => {
            this.isPlaying = true;
            this.updatePlayButton();
            this.startTextHighlight(text);
        };

        this.currentUtterance.onend = () => {
            this.isPlaying = false;
            this.updatePlayButton();
            this.clearTextHighlight();
        };

        this.currentUtterance.onerror = () => {
            this.isPlaying = false;
            this.updatePlayButton();
            this.showToast('语音播放出错，请重试');
        };

        this.speechSynthesis.speak(this.currentUtterance);
    }

    stopPlayback() {
        if (this.speechSynthesis) {
            this.speechSynthesis.cancel();
        }
        this.isPlaying = false;
        this.updatePlayButton();
        this.clearTextHighlight();
    }

    updatePlayButton() {
        const playBtn = document.getElementById('playBtn');
        const icon = playBtn.querySelector('i');
        
        if (this.isPlaying) {
            icon.className = 'fas fa-pause';
        } else {
            icon.className = 'fas fa-play';
        }
    }

    startTextHighlight(text) {
        this.clearTextHighlight();
        
        const paragraph = document.getElementById('storyParagraph');
        const words = text.split('');
        let currentIndex = 0;
        
        const highlightInterval = setInterval(() => {
            if (currentIndex < words.length && this.isPlaying) {
                this.highlightCharacter(paragraph, currentIndex);
                currentIndex++;
            } else {
                clearInterval(highlightInterval);
            }
        }, 150); // 调整高亮速度
        
        this.highlightTimeout = highlightInterval;
    }

    highlightCharacter(paragraph, index) {
        const text = paragraph.textContent;
        const beforeText = text.substring(0, index);
        const currentChar = text.charAt(index);
        const afterText = text.substring(index + 1);
        
        paragraph.innerHTML = beforeText + 
                             `<span class="highlight">${currentChar}</span>` + 
                             afterText;
    }

    clearTextHighlight() {
        if (this.highlightTimeout) {
            clearInterval(this.highlightTimeout);
            this.highlightTimeout = null;
        }
        
        const paragraph = document.getElementById('storyParagraph');
        if (paragraph && this.currentStory) {
            paragraph.textContent = this.currentStory.paragraphs[this.currentPageIndex];
        }
    }

    saveStory() {
        if (!this.currentStory) return;
        
        try {
            const savedStories = JSON.parse(localStorage.getItem('savedStories') || '[]');
            const storyToSave = {
                ...this.currentStory,
                savedAt: new Date().toISOString()
            };
            
            savedStories.push(storyToSave);
            localStorage.setItem('savedStories', JSON.stringify(savedStories));
            
            this.showToast('故事已保存！');
        } catch (error) {
            console.error('保存故事失败:', error);
            this.showToast('保存失败，请重试');
        }
    }

    shareStory() {
        if (!this.currentStory) return;
        
        const shareData = {
            title: this.currentStory.title,
            text: `我在AI绘本创建了一个精彩的故事：${this.currentStory.title}`,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData).catch(console.error);
        } else {
            // 备用分享方案
            const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                this.showToast('分享链接已复制到剪贴板！');
            }).catch(() => {
                this.showToast('分享功能暂不支持，请手动复制链接');
            });
        }
    }

    goHome() {
        this.stopPlayback();
        this.currentStory = null;
        this.currentPageIndex = 0;
        document.getElementById('storyInput').value = '';
        this.showPage('homePage');
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.style.display = 'none';
        });
        document.getElementById(pageId).style.display = 'flex';
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    showSettings() {
        // 加载当前设置
        const useRealAPI = localStorage.getItem('useRealAPI') === 'true';
        document.getElementById('useRealAPICheckbox').checked = useRealAPI;
        
        document.getElementById('settingsModal').style.display = 'flex';
    }

    hideSettings() {
        document.getElementById('settingsModal').style.display = 'none';
    }

    saveSettings() {
        const useRealAPI = document.getElementById('useRealAPICheckbox').checked;
        
        // 保存设置到本地存储
        localStorage.setItem('useRealAPI', useRealAPI.toString());
        
        // 更新图片生成器设置
        if (useRealAPI) {
            this.imageGenerator.enableRealAPI();
            this.showToast('已启用真实AI图片生成 - 注意：这可能产生费用');
        } else {
            this.imageGenerator.disableRealAPI();
            this.showToast('已切换到免费图片模式');
        }
        
        this.hideSettings();
    }

    loadSettings() {
        // 启动时加载设置
        const useRealAPI = localStorage.getItem('useRealAPI') === 'true';
        if (useRealAPI) {
            this.imageGenerator.enableRealAPI();
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new StoryApp();
});

// 防止页面缩放
document.addEventListener('touchstart', function(event) {
    if (event.touches.length > 1) {
        event.preventDefault();
    }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);