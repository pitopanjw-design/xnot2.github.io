const stones = [
    { name: "평범한 조약돌", image: "images/stone_ordinary.png", mult: 1.0, luck: 0.1, desc: "표준 성능의 무난한 기본 조약돌" },
    { name: "거친 현무암", image: "images/stone_rare.png", mult: 0.6, luck: 0.6, desc: "낮은 확률이지만 대박나면 대량 채굴 가능한 도박성 돌" },
    { name: "슬레이트 판암", image: "images/stone_legendary.png", mult: 1.5, luck: 0.05, desc: "안정적인 각도로 평균 튕김 수가 매우 높음 (효율형)" },
    { name: "황금빛 운석", image: "images/stone_mythic.png", mult: 2.5, luck: 0.8, desc: "신화급 확률로 수평선을 뚫는 극대량 채굴석" }
];

let playerHearts = 5;
let playerSP = 0;

let selectedStone = null;
let isSpinning = false;
let startY = 0;
let startTime = 0;
let isPlaying = false;
let currentStatus = "PRE_SPIN"; 

const rouletteScreen = document.getElementById('roulette-screen');
const wheelEl = document.getElementById('roulette-wheel');
const stoneDisplayName = document.getElementById('stone-display-name');
const stoneDesc = document.getElementById('stone-desc');
const mainBtn = document.getElementById('main-action-btn');
const ingameStoneEl = document.getElementById('ingame-stone');
const scoreDisplay = document.getElementById('score-display');
const message = document.getElementById('message');
const container = document.getElementById('game-container');

const heartsCountEl = document.getElementById('hearts-count');
const spCountEl = document.getElementById('sp-count');
const youtubeModal = document.getElementById('youtube-modal');
const videoTimerEl = document.getElementById('video-timer');

function updateAssetUI() {
    heartsCountEl.innerText = playerHearts;
    spCountEl.innerText = playerSP.toLocaleString();
    
    if (playerHearts <= 0 && currentStatus === "PRE_SPIN") {
        document.getElementById('roulette-title').innerText = "하트 부족! 에너지를 충전하세요.";
        mainBtn.innerText = "❤️ 유튜브 시청하고 하트 완충";
        mainBtn.style.background = "#ef4444";
        mainBtn.style.color = "white";
    }
}

function triggerWheel(e) {
    if (e) e.preventDefault();
    if (playerHearts <= 0) {
        openYoutubeCharge();
        return;
    }
    if (isSpinning || currentStatus !== "PRE_SPIN") return;
    isSpinning = true;
    let tick = 0;
    
    const timer = setInterval(() => {
        const current = stones[Math.floor(Math.random() * stones.length)];
        stoneDisplayName.innerText = current.name;
        stoneDesc.innerText = current.desc;
        
        wheelEl.style.transform = `rotate(${tick * 45}deg)`;
        tick++;
        
        if(tick > 12) {
            clearInterval(timer);
            selectedStone = current;
            wheelEl.style.transform = `rotate(0deg)`; 
            stoneDisplayName.innerText = selectedStone.name;
            
            ingameStoneEl.style.backgroundImage = `url('${selectedStone.image}')`;
            
            document.getElementById('roulette-title').innerText = "STONE READY!";
            mainBtn.innerText = "LAUNCH STONE (❤️ 1 소모)";
            mainBtn.style.background = "#deff9a";
            mainBtn.style.color = "#0f172a";
            currentStatus = "SPIN_DONE";
            isSpinning = false;
        }
    }, 90);
}

wheelEl.ontouchstart = triggerWheel;
wheelEl.onclick = triggerWheel;

const handleMainBtn = (e) => {
    e.preventDefault();
    if (playerHearts <= 0 && currentStatus === "PRE_SPIN") {
        openYoutubeCharge();
        return;
    }

    if (currentStatus === "PRE_SPIN") {
        triggerWheel();
    } else if (currentStatus === "SPIN_DONE") {
        playerHearts--; 
        updateAssetUI();

        rouletteScreen.style.display = 'none'; 
        
        ingameStoneEl.style.left = '50%';
        ingameStoneEl.style.top = '80%';
        ingameStoneEl.style.transform = 'translate(-50%, -50%) scale(1)';
        ingameStoneEl.style.opacity = '1';
        ingameStoneEl.style.display = 'block';
        
        document.getElementById('swipe-guide').style.display = 'block';
        scoreDisplay.innerText = "0 SKIPS";
        message.innerText = "SWIPE UP FAST!";
        isPlaying = true;
        currentStatus = "PLAYING";
    }
};

mainBtn.ontouchstart = handleMainBtn;
mainBtn.onclick = handleMainBtn;

function openYoutubeCharge() {
    youtubeModal.style.display = "flex";
    let timeLeft = 5;
    videoTimerEl.innerText = timeLeft;
    
    const adTimer = setInterval(() => {
        timeLeft--;
        videoTimerEl.innerText = timeLeft;
        if(timeLeft <= 0) {
            clearInterval(adTimer);
            playerHearts = 5;
            youtubeModal.style.display = "none";
            
            document.getElementById('roulette-title').innerText = "TOUCH THE WHEEL TO START CHANCE";
            mainBtn.innerText = "SPIN WHEEL";
            mainBtn.style.background = "var(--primary)";
            mainBtn.style.color = "#0f172a";
            
            updateAssetUI();
        }
    }, 1000);
}

function onDragStart(e) {
    if(!isPlaying) return;
    startY = e.touches ? e.touches[0].clientY : e.clientY;
    startTime = Date.now();
}

function onDragEnd(e) {
    if(!isPlaying) return;
    const endY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const dist = startY - endY; 
    const duration = Date.now() - startTime;
    
    if (dist > 10) {
        let speed = dist / (duration || 1);
        launchStone(speed);
    }
}

ingameStoneEl.addEventListener('touchstart', onDragStart, { passive: true });
ingameStoneEl.addEventListener('touchend', onDragEnd, { passive: true });
ingameStoneEl.addEventListener('mousedown', onDragStart);
ingameStoneEl.addEventListener('mouseup', onDragEnd);

function launchStone(speed) {
    isPlaying = false;
    document.getElementById('swipe-guide').style.display = 'none';
    
    let totalBounces = Math.floor(speed * 9 * selectedStone.mult);
    if(Math.random() < selectedStone.luck) {
        totalBounces = Math.floor(totalBounces * 2.2);
        message.innerText = "⚡ CRITICAL LUCKY HIT! ⚡";
    } else {
        message.innerText = "NICE SHOT!";
    }
    if(totalBounces < 3) totalBounces = 3; 

    animateSkipping(totalBounces);
}

function animateSkipping(total) {
    const startYPosition = window.innerHeight * 0.8; 
    const horizonY = window.innerHeight * 0.35;       
    const totalDistanceY = startYPosition - horizonY;
    
    let currentBounce = 0;
    let stepStartTime = performance.now();

    createBounceEffect(window.innerWidth / 2, startYPosition, 1);

    function frameLoop(timestamp) {
        // [대표님 기획] 튕김 템포 변화식 (천천히 -> 점점 다다닥)
        const progress = currentBounce / total;
        const stepDuration = 250 * Math.pow(1 - (progress * 0.6), 2); 
        
        let progressInStep = (timestamp - stepStartTime) / stepDuration;
        if (progressInStep > 1) progressInStep = 1;

        const totalProgress = Math.min((currentBounce + progressInStep) / total, 1);

        // [대표님 기획] 크기 변화 가속 곡선 (소실점에서 순간 압축 축소)
        const scaleProgress = Math.pow(totalProgress, 2);
        const scale = 1 - (scaleProgress * 0.65); 

        const surfaceY = startYPosition - (totalDistanceY * Math.pow(totalProgress, 0.65));
        const currentX = window.innerWidth / 2;

        // [대표님 기획] 위아래 튕김 폭 감쇄 포물선
        const maxJumpHeight = 120 * Math.pow(1 - totalProgress, 1.5); 
        const jumpOffset = Math.sin(progressInStep * Math.PI) * maxJumpHeight;
        
        const stoneRenderY = surfaceY - jumpOffset;

        ingameStoneEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
        ingameStoneEl.style.left = `${currentX}px`;
        ingameStoneEl.style.top = `${stoneRenderY}px`;

        if (progressInStep >= 1) {
            currentBounce++;
            stepStartTime = timestamp;

            if (currentBounce < total) {
                createBounceEffect(currentX, surfaceY, currentBounce + 1);
                scoreDisplay.innerText = `${currentBounce + 1} SKIPS`;
                if(navigator.vibrate) navigator.vibrate(15);
            }
        }

        if (currentBounce < total) {
            requestAnimationFrame(frameLoop);
        } else {
            // 깔끔한 침몰 처리
            ingameStoneEl.style.transition = "opacity 0.6s ease-out, top 0.6s ease-out";
            ingameStoneEl.style.top = `${surfaceY + 40}px`;
            ingameStoneEl.style.opacity = '0';

            const minedSP = total * 1000;
            playerSP += minedSP;
            updateAssetUI();
            
            message.innerText = `🎉 +${minedSP.toLocaleString()} SP 채굴 완료!`;
            
            setTimeout(() => {
                document.querySelectorAll('.bounce-point').forEach(p => p.remove());
                ingameStoneEl.style.transition = "none"; 
                ingameStoneEl.style.display = 'none';
                
                stoneDisplayName.innerText = "돌 뽑기 터치!";
                stoneDesc.innerText = "다음 기회를 위해 돌을 다시 뽑으세요.";
                mainBtn.innerText = "SPIN WHEEL";
                
                currentStatus = "PRE_SPIN";
                rouletteScreen.style.display = 'flex';
                updateAssetUI();
            }, 1800);
        }
    }

    requestAnimationFrame(frameLoop);
}

function createBounceEffect(x, y, count) {
    const point = document.createElement('div');
    point.className = 'bounce-point';
    point.style.left = `${x}px`;
    point.style.top = `${y}px`;
    point.innerText = count;
    container.appendChild(point);

    const rip = document.createElement('div');
    rip.className = 'ripple';
    rip.style.left = `${x}px`;
    rip.style.top = `${y}px`;
    container.appendChild(rip);
}

updateAssetUI();