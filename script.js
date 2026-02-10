// Global Variables
let currentMode = 'text';
let currentVideo = null;
let videoFrames = [];

// Example Content
const examples = {
    1: "In this video, I'll show you 5 AI tools that will save you 10 hours every week. Number 3 will blow your mind! Let's get started.",
    2: "Just spent 6 months building my dream app and finally launched today! 🚀 The journey was crazy but here's what I learned about staying consistent when nobody's watching. Link in bio 👆",
    3: "What if I told you that you're wasting 3 hours every day without even realizing it? In this short, I'll expose the hidden time-killers and show you exactly how to get those hours back."
};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('IntelixAI loaded successfully!');
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Character counter
    document.getElementById('textInput').addEventListener('input', function() {
        document.getElementById('charCount').textContent = this.value.length;
    });

    // Upload zone
    const uploadZone = document.getElementById('uploadZone');
    const videoFile = document.getElementById('videoFile');

    uploadZone.addEventListener('click', () => videoFile.click());

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        if (e.dataTransfer.files.length > 0) {
            handleVideoFile(e.dataTransfer.files[0]);
        }
    });

    videoFile.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleVideoFile(e.target.files[0]);
        }
    });
}

// Switch Mode (Text/Video)
function switchMode(mode) {
    currentMode = mode;
    
    document.querySelectorAll('.mode-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    if (mode === 'text') {
        document.querySelectorAll('.mode-tab')[0].classList.add('active');
        document.getElementById('textTab').classList.add('active');
    } else {
        document.querySelectorAll('.mode-tab')[1].classList.add('active');
        document.getElementById('videoTab').classList.add('active');
    }

    document.getElementById('resultsPanel').classList.remove('show');
}

// Load Example
function loadExample(num) {
    const textarea = document.getElementById('textInput');
    textarea.value = examples[num];
    document.getElementById('charCount').textContent = examples[num].length;
    
    // Add a little animation
    textarea.style.transform = 'scale(0.98)';
    setTimeout(() => {
        textarea.style.transform = 'scale(1)';
    }, 100);
}

// Handle Video File Upload
function handleVideoFile(file) {
    const maxSize = 100 * 1024 * 1024; // 100MB
    
    if (!file.type.startsWith('video/')) {
        alert('⚠️ Please upload a video file!\n\nSupported formats: MP4, MOV, WebM');
        return;
    }

    if (file.size > maxSize) {
        alert('⚠️ File too large!\n\nMaximum file size is 100MB.\nYour file: ' + (file.size / (1024 * 1024)).toFixed(2) + 'MB');
        return;
    }

    const url = URL.createObjectURL(file);
    const video = document.getElementById('videoPlayer');
    video.src = url;
    currentVideo = video;

    video.addEventListener('loadedmetadata', function() {
        const duration = video.duration.toFixed(1);
        const size = (file.size / (1024 * 1024)).toFixed(2);
        const width = video.videoWidth;
        const height = video.videoHeight;
        
        document.getElementById('videoInfo').innerHTML = `
            <div class="info-row">
                <strong>📁 Filename:</strong> 
                <span>${file.name}</span>
            </div>
            <div class="info-row">
                <strong>⏱️ Duration:</strong> 
                <span>${duration} seconds</span>
            </div>
            <div class="info-row">
                <strong>📦 File Size:</strong> 
                <span>${size} MB</span>
            </div>
            <div class="info-row">
                <strong>📐 Resolution:</strong> 
                <span>${width} × ${height} pixels</span>
            </div>
        `;

        document.getElementById('videoPreview').classList.add('show');
    });
}

// Remove Video
function removeVideo() {
    const video = document.getElementById('videoPlayer');
    video.pause();
    video.src = '';
    document.getElementById('videoFile').value = '';
    document.getElementById('videoPreview').classList.remove('show');
    currentVideo = null;
    videoFrames = [];
    document.getElementById('resultsPanel').classList.remove('show');
}

// Start Analysis
async function startAnalysis() {
    if (currentMode === 'text') {
        const text = document.getElementById('textInput').value.trim();
        if (!text) {
            alert('⚠️ Please enter some text to analyze!');
            return;
        }
        await analyzeText(text);
    } else {
        if (!currentVideo) {
            alert('⚠️ Please upload a video first!');
            return;
        }
        await analyzeVideo();
    }
}

// Analyze Text
async function analyzeText(text) {
    showLoading('Analyzing your text content...');
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1800));

    const words = text.split(/\s+/).length;
    const hasQuestion = text.includes('?');
    const hasNumbers = /\d+/.test(text);
    const hook = text.split(/[.!?]/)[0];
    const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(text);

    let score = 60;
    if (hook.length < 80) score += 10;
    if (hasQuestion) score += 10;
    if (hasNumbers) score += 15;
    if (words < 100 && words > 20) score += 8;
    if (hasEmoji) score += 5;
    if (text.toLowerCase().includes('you')) score += 2;
    
    score = Math.min(score, 100);

    const analysis = {
        type: 'text',
        score: score,
        verdict: score >= 85 ? 'Ready to post' : score >= 70 ? 'Good but can be better' : 'Needs improvement',
        hookLength: hook.length,
        hasQuestion: hasQuestion,
        hasNumbers: hasNumbers,
        hasEmoji: hasEmoji,
        wordCount: words
    };

    displayResults(analysis);
}

// Analyze Video
async function analyzeVideo() {
    showLoading('Analyzing your video...');

    const video = currentVideo;
    const duration = video.duration;
    const width = video.videoWidth;
    const height = video.videoHeight;
    const isVertical = height > width;

    // Extract frames
    await extractVideoFrames();

    let score = 65;
    if (duration < 15) score += 15;
    else if (duration < 30) score += 12;
    else if (duration < 60) score += 5;
    
    if (width >= 1080) score += 12;
    else if (width >= 720) score += 7;
    
    if (isVertical) score += 11;
    
    score = Math.min(score, 100);

    const analysis = {
        type: 'video',
        score: score,
        verdict: score >= 85 ? 'Ready to post' : score >= 70 ? 'Good but can be better' : 'Needs improvement',
        duration: duration,
        width: width,
        height: height,
        isVertical: isVertical,
        hasHD: width >= 1080
    };

    displayResults(analysis);
}

// Extract Video Frames
async function extractVideoFrames() {
    const video = currentVideo;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth / 3;
    canvas.height = video.videoHeight / 3;

    videoFrames = [];
    const times = [0, 1, 3];

    for (let time of times) {
        if (time < video.duration) {
            video.currentTime = time;
            await new Promise(resolve => {
                video.addEventListener('seeked', function handler() {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    videoFrames.push(canvas.toDataURL('image/jpeg', 0.85));
                    video.removeEventListener('seeked', handler);
                    resolve();
                });
            });
            await new Promise(r => setTimeout(r, 150));
        }
    }
}

// Show Loading State
function showLoading(text) {
    document.getElementById('loadingText').textContent = text;
    document.getElementById('resultsPanel').classList.add('show');
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('resultsDisplay').classList.remove('show');
    document.getElementById('analyzeBtn').disabled = true;
}

// Display Results
function displayResults(analysis) {
    const scoreCircle = document.getElementById('scoreCircle');
    const verdict = document.getElementById('verdict');
    
    scoreCircle.textContent = analysis.score;
    verdict.textContent = analysis.verdict;
    
    let color = '#ef4444';
    if (analysis.score >= 85) color = '#10b981';
    else if (analysis.score >= 70) color = '#f59e0b';
    scoreCircle.style.background = color;

    let html = '';

    if (analysis.type === 'video') {
        html += `
            <div class="result-block">
                <div class="result-title">🎯 Opening Hook (First 3 Seconds)</div>
                <div class="frames-grid" id="framesGrid"></div>
                <p style="margin-top: 15px; color: #6b7280; line-height: 1.6;">
                    ${analysis.duration < 3 
                        ? '✅ <strong>Excellent!</strong> Your video hooks viewers immediately. The first 3 seconds are engaging and create curiosity.' 
                        : '⚠️ <strong>Consider improving:</strong> Make your opening more compelling. Add text overlays or visual interest in the first 3 seconds to grab attention faster.'}
                </p>
            </div>
            <div class="result-block">
                <div class="result-title">📊 Technical Quality Assessment</div>
                <ul class="result-list">
                    <li><strong>Format:</strong> ${analysis.isVertical 
                        ? '✅ Vertical (9:16) - Perfect for Instagram Reels, TikTok & YouTube Shorts' 
                        : '⚠️ Horizontal - Consider shooting in vertical format (9:16) for better social media performance'}</li>
                    <li><strong>Resolution:</strong> ${analysis.width}×${analysis.height} ${analysis.hasHD 
                        ? '✅ HD Quality - Excellent!' 
                        : '⚠️ Low quality - Record in at least 1080p for best results'}</li>
                    <li><strong>Duration:</strong> ${analysis.duration.toFixed(1)}s ${analysis.duration < 30 
                        ? '✅ Great length for social media' 
                        : '⚠️ Too long - Keep videos under 30 seconds for maximum retention'}</li>
                </ul>
            </div>
            <div class="result-block">
                <div class="result-title">💡 Key Improvements</div>
                <ul class="result-list">
                    ${!analysis.isVertical ? '<li>📱 Shoot in vertical format (9:16 aspect ratio) - essential for Reels, TikTok, and Shorts</li>' : ''}
                    ${!analysis.hasHD ? '<li>🎥 Record in 1080p or higher resolution for better quality and professionalism</li>' : ''}
                    ${analysis.duration > 30 ? '<li>✂️ Edit your video down to under 30 seconds for better viewer retention</li>' : ''}
                    ${analysis.duration > 15 ? '<li>⏱️ Aim for 15-20 seconds for maximum engagement and watch-through rate</li>' : ''}
                    <li>📝 Add captions/subtitles - 85% of viewers watch without sound</li>
                    <li>🎵 Use trending audio to boost discoverability by 50-70%</li>
                    <li>🎨 Add bold text overlay in the first 3 seconds as a hook</li>
                    <li>📊 Include a clear CTA (Call-To-Action) at the end</li>
                </ul>
            </div>
        `;
    } else {
        html += `
            <div class="result-block">
                <div class="result-title">🎯 Hook Analysis</div>
                <p style="color: #6b7280; line-height: 1.6;">
                    <strong>Hook length:</strong> ${analysis.hookLength} characters<br>
                    ${analysis.hookLength < 60 
                        ? '✅ <strong>Perfect!</strong> Your hook is concise and punchy. Short hooks (under 60 characters) perform 40% better on social media.' 
                        : '⚠️ <strong>Too long.</strong> Your hook should be under 60 characters for maximum impact. Current viewers scroll past long intros.'}
                </p>
            </div>
            <div class="result-block">
                <div class="result-title">📝 Content Elements</div>
                <ul class="result-list">
                    <li><strong>Word count:</strong> ${analysis.wordCount} words ${analysis.wordCount < 100 ? '✅' : '⚠️ Consider shortening'}</li>
                    <li><strong>Question included:</strong> ${analysis.hasQuestion ? '✅ Yes - Great for engagement!' : '⚠️ No - Add a question to boost comments'}</li>
                    <li><strong>Numbers/Stats:</strong> ${analysis.hasNumbers ? '✅ Yes - Adds credibility!' : '⚠️ No - Add specific numbers for more impact'}</li>
                    <li><strong>Emojis:</strong> ${analysis.hasEmoji ? '✅ Yes - Increases visual appeal' : '💡 Consider adding 2-3 relevant emojis'}</li>
                </ul>
            </div>
            <div class="result-block">
                <div class="result-title">💡 Optimization Tips</div>
                <ul class="result-list">
                    ${!analysis.hasQuestion ? '<li>❓ Add a compelling question to engage viewers and encourage comments</li>' : ''}
                    ${!analysis.hasNumbers ? '<li>🔢 Include specific numbers or statistics to add credibility and grab attention</li>' : ''}
                    ${!analysis.hasEmoji ? '<li>😊 Add 2-3 relevant emojis to make your text more visually appealing</li>' : ''}
                    <li>🎬 Keep your script under 100 words for better pacing when filming</li>
                    <li>📣 End with a clear call-to-action (Like, Follow, Comment, Share)</li>
                    <li>🎵 Use trending audio when creating your video</li>
                    <li>📝 Add text overlays for key points to help viewers who watch without sound</li>
                </ul>
            </div>
        `;
    }

    html += `
        <div class="result-block">
            <div class="result-title">📈 Recommended Hashtags</div>
            <ul class="hashtags">
                <li>#reels</li>
                <li>#viral</li>
                <li>#contentcreator</li>
                <li>#fyp</li>
                <li>#trending</li>
                <li>#explore</li>
                <li>#socialmedia</li>
            </ul>
        </div>
        <div class="result-block">
            <div class="result-title">⏰ Best Posting Time</div>
            <p style="color: #374151; font-size: 1.05em; line-height: 1.7;">
                <strong style="color: #667eea; font-size: 1.15em;">7-9 PM</strong> in your timezone<br>
                <span style="color: #6b7280;">This is when engagement rates are highest (up to 3x normal)</span>
            </p>
            <p style="margin-top: 12px; color: #6b7280; font-size: 0.95em;">
                📅 <strong>Alternative times:</strong> 11 AM - 1 PM (lunch break) or 6-8 AM (morning commute)
            </p>
        </div>
        <div class="result-block">
            <div class="result-title">🚀 Pro Growth Tips</div>
            <div class="tip-box">
                <strong>Consistency is key:</strong> Post at the same time every day to train the algorithm and build audience anticipation.<br><br>
                <strong>Engage immediately:</strong> Reply to ALL comments within the first 60 minutes. This signals the algorithm to boost your content to more viewers.<br><br>
                <strong>Use trending sounds:</strong> Content with trending audio gets 30-50% more reach. Check your platform's trending section daily.<br><br>
                <strong>Cross-post strategically:</strong> Share the same video on Instagram Reels, TikTok, and YouTube Shorts to maximize reach across platforms.
            </div>
        </div>
    `;

    document.getElementById('resultsContent').innerHTML = html;

    // Add video frames if available
    if (analysis.type === 'video' && videoFrames.length > 0) {
        const framesGrid = document.getElementById('framesGrid');
        videoFrames.forEach(frameData => {
            const img = document.createElement('img');
            img.src = frameData;
            img.alt = 'Video frame preview';
            framesGrid.appendChild(img);
        });
    }

    // Show results with animation
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('resultsDisplay').classList.add('show');
    document.getElementById('analyzeBtn').disabled = false;
}