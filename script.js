const stones = [
    { id: "ordinary", name: "평범한 조약돌", image: "images/stone_ordinary.png", rippleColor: "rgba(255,255,255,0.8)", desc: "강가에서 흔히 볼 수 있는 친숙한 기본 조약돌" },
    { id: "rare", name: "거친 현무암", image: "images/stone_rare.png", rippleColor: "rgba(0,191,255,0.9)", desc: "수면에 닿을 때마다 푸른 이온 스파크 파동이 터지는 돌" },
    { id: "legendary", name: "슬레이트 판암", image: "images/stone_legendary.png", rippleColor: "rgba(239,68,68,0.9)", desc: "붉은 마그마 광용 파동을 일으키는 얇고 날카로운 암석" },
    { id: "mythic", name: "XNOT 황금 운석", image: "images/stone_mythic.png", rippleColor: "rgba(222,255,154,1)", desc: "신화급 외형! 수면을 타격할 때 시그니처 황금 파동이 폭발함" }
];

// 랜덤 게임 배경화면 배열
const gameBackgrounds = [
    "images/bg_stage_1.png", 
    "images/bg_stage_2.png", 
    "images/bg_stage_3.png", 
    "images/bg_stage_4.png"  
];

let playerHearts = 5;
let playerSP = 0;
let unlockedSkins = ["ordinary"]; 

let selectedStone = stones[0]; 
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

// [근본 해결] 첫 기동 시점 및 리셋 시점에 인게임 기본 스테이지 배경을 미리 주입하여 검은 화면 원천 차단
function initGameSettings() {
    if (container) container.style.backgroundImage = `url('${gameBackgrounds[0]}')`;
    updateAssetUI();
}

function updateAssetUI() {
    if (heartsCountEl) heartsCountEl.innerText = playerHearts;
    if (spCountEl) spCountEl.innerText = playerSP.toLocaleString();
    
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
        
        if (wheelEl) wheelEl.style.transform = `rotate(${tick * 45}deg)`;
        tick++;
        
        if(tick > 12) {
            clearInterval(timer);
            selectedStone = current;
            if (wheelEl) wheelEl.style.transform = `rotate(0deg)`; 
            
            if (!unlockedSkins.includes(selectedStone.id)) {
                unlockedSkins.push(selectedStone.id);
                stoneDisplayName.innerText = `🎉 신규 스킨! ${selectedStone.name}`;
            } else {
                stoneDisplayName.innerText = `${selectedStone.name} (보유 중)`;
            }
            
            if (ingameStoneEl) ingameStoneEl.style.backgroundImage = `url('${selectedStone.image}')`;
            
            document.getElementById('roulette-title').innerText = "SKIN READY!";
            mainBtn.innerText = "LAUNCH STONE (❤️ 1 소모)";
            mainBtn.style.background = "#deff9a";
            mainBtn.style.color = "#0f172a";
            currentStatus = "SPIN_DONE";
            isSpinning = false;
        }
    }, 90);
}

if (wheelEl) {
    wheelEl.ontouchstart = triggerWheel;
    wheelEl.onclick = triggerWheel;
}

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

        // 룰렛 창이 닫히기 직전, 인게임 백그라운드에 랜덤 배경을 주입 (레이어 격리로 안전하게 처리)
        const randomBg = gameBackgrounds[Math.floor(Math.random() * gameBackgrounds.length)];
        if (container) container.style.backgroundImage = `url('${randomBg}')`;

        if (rouletteScreen) rouletteScreen.style.display = 'none'; 
        
        if (ingameStoneEl) {
            ingameStoneEl.style.left = '50%';
            ingameStoneEl.style.top = '80%';
            ingameStoneEl.style.transform = 'translate(-50%, -50%) scale(1)';
            ingameStoneEl.style.opacity = '1';
            ingameStoneEl.style.display = 'block';
        }
        
        document.getElementById('swipe-guide').style.display = 'block';
        scoreDisplay.innerText = "0 SKIPS";
        message.innerText = "SWIPE UP FAST!";
        isPlaying = true;
        currentStatus = "PLAYING";
    }
};

if (mainBtn) {
    mainBtn.ontouchstart = handleMainBtn;
    mainBtn.onclick = handleMainBtn;
}

function openYoutubeCharge() {
    if (youtubeModal) youtubeModal.style.display = "flex";
    let timeLeft = 5;
    if (videoTimerEl) videoTimerEl.innerText = timeLeft;
    
    const adTimer = setInterval(() => {
        timeLeft--;
        if (videoTimerEl) videoTimerEl.innerText = timeLeft;
        if(timeLeft <= 0) {
            clearInterval(adTimer);
            playerHearts = 5;
            if (youtubeModal) youtubeModal.style.display = "none";
            
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

if (ingameStoneEl) {
    ingameStoneEl.addEventListener('touchstart', onDragStart, { passive: true });
    ingameStoneEl.addEventListener('touchend', onDragEnd, { passive: true });
    ingameStoneEl.addEventListener('mousedown', onDragStart);
    ingameStoneEl.addEventListener('mouseup', onDragEnd);
}

function launchStone(speed) {
    isPlaying = false;
    document.getElementById('swipe-guide').style.display = 'none';
    
    let totalBounces = Math.floor(speed * 10);
    message.innerText = "GOOOOAL!";
    if(totalBounces < 3) totalBounces = 3; 

    animateSkipping(totalBounces);
}

function animateSkipping(total) {
    const startYPosition = window.innerHeight * 0.8; 
    const horizonY = window.innerHeight * 0.35;       
    const totalDistanceY = startYPosition - horizonY;
    
    let currentBounce = 0;
    let stepStartTime = performance.now();

    createBounceEffect(window.innerWidth / 2, startYPosition, 1, selectedStone.rippleColor);

    function frameLoop(timestamp) {
        const progress = currentBounce / total;
        const stepDuration = 260 * Math.pow(1 - progress, 2.5) + 35; // 대표님 시그니처 가속 리듬
        
        let progressInStep = (timestamp - stepStartTime) / stepDuration;
        if (progressInStep > 1) progressInStep = 1;

        const totalProgress = Math.min((currentBounce + progressInStep) / total, 1);

        const scaleProgress = Math.pow(totalProgress, 2);
        const scale = 1 - (scaleProgress * 0.65); 

        const surfaceY = startYPosition - (totalDistanceY * Math.pow(totalProgress, 0.65));
        const currentX = window.innerWidth / 2;

        const maxJumpHeight = 140 * Math.pow(1 - totalProgress, 1.8); 
        const jumpOffset = Math.sin(progressInStep * Math.PI) * maxJumpHeight;
        
        const stoneRenderY = surfaceY - jumpOffset;

        if (ingameStoneEl) {
            ingameStoneEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
            ingameStoneEl.style.left = `${currentX}px`;
            ingameStoneEl.style.top = `${stoneRenderY}px`;
        }

        if (progressInStep >= 1) {
            currentBounce++;
            stepStartTime = timestamp;

            if (currentBounce < total) {
                createBounceEffect(currentX, surfaceY, currentBounce + 1, selectedStone.rippleColor);
                scoreDisplay.innerText = `${currentBounce + 1} SKIPS`;
                if(navigator.vibrate) navigator.vibrate(15);
            }
        }

        if (currentBounce < total) {
            requestAnimationFrame(frameLoop);
        } else {
            if (ingameStoneEl) {
                ingameStoneEl.style.transition = "opacity 0.6s ease-out, top 0.6s ease-out";
                ingameStoneEl.style.top = `${surfaceY + 40}px`;
                ingameStoneEl.style.opacity = '0';
            }

            const minedSP = total * 1000;
            playerSP += minedSP;
            updateAssetUI();
            
            message.innerText = `🎉 +${minedSP.toLocaleString()} SP 채굴 완료!`;
            
            setTimeout(() => {
                document.querySelectorAll('.bounce-point').forEach(p => p.remove());
                if (ingameStoneEl) {
                    ingameStoneEl.style.transition = "none"; 
                    ingameStoneEl.style.display = 'none';
                }
                
                stoneDisplayName.innerText = "돌 뽑기 터치!";
                stoneDesc.innerText = "다음 기회를 위해 돌을 다시 뽑으세요.";
                mainBtn.innerText = "SPIN WHEEL";
                
                currentStatus = "PRE_SPIN";
                
                // [근본 해결] 인게임 정산 후 자바스크립트가 배경을 "none"으로 날리던 코드를 영구 삭제. 
                // 단순히 룰렛 레이어를 다시 켜는 것으로 마감하여 하위 인게임 배경과 상위 대장간 배경이 철저히 독립 유지됨.
                if (rouletteScreen) rouletteScreen.style.display = 'flex';
                updateAssetUI();
            }, 1800);
        }
    }

    requestAnimationFrame(frameLoop);
}

function createBounceEffect(x, y, count, color) {
    const point = document.createElement('div');
    point.className = 'bounce-point';
    point.style.left = `${x}px`;
    point.style.top = `${y}px`;
    point.innerText = count;
    if (container) container.appendChild(point);

    const rip = document.createElement('div');
    rip.className = 'ripple';
    rip.style.left = `${x}px`;
    rip.style.top = `${y}px`;
    rip.style.borderColor = color;
    if (container) container.appendChild(rip);
}

initGameSettings();