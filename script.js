// [★대표님 직관 반영] 성능 왜곡 전면 폐기 -> 오직 외형 스킨 컬렉션 데이터셋으로 재조립
const stones = [
    { id: "ordinary", name: "평범한 조약돌", image: "images/stone_ordinary.png", rippleColor: "rgba(255,255,255,0.8)", desc: "강가에서 흔히 볼 수 있는 친숙한 기본 조약돌" },
    { id: "rare", name: "거친 현무암", image: "images/stone_rare.png", rippleColor: "rgba(0,191,255,0.9)", desc: "수면에 닿을 때마다 푸른 이온 스파크 파동이 터지는 돌" },
    { id: "legendary", name: "슬레이트 판암", image: "images/stone_legendary.png", rippleColor: "rgba(239,68,68,0.9)", desc: "붉은 마그마 광용 파동을 일으키는 얇고 날카로운 암석" },
    { id: "mythic", name: "XNOT 황금 운석", image: "images/stone_mythic.png", rippleColor: "rgba(222,255,154,1)", desc: "신화급 외형! 수면을 타격할 때 시그니처 황금 파동이 폭발함" }
];

// [★대표님 지시] 돌 종류와 무관하게 완전히 무작위로 바뀔 게임 배경 이미지 리스트
const gameBackgrounds = [
    "images/bg_stage_1.png", // 기본 강가
    "images/bg_stage_2.png", // 신비로운 호수
    "images/bg_stage_3.png", // 밤의 계곡
    "images/bg_stage_4.png"  
];

// 유저 자산 및 컬렉션 상태 데이터
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
            
            if (!unlockedSkins.includes(selectedStone.id)) {
                unlockedSkins.push(selectedStone.id);
                stoneDisplayName.innerText = `🎉 신규 스킨! ${selectedStone.name}`;
            } else {
                stoneDisplayName.innerText = `${selectedStone.name} (보유 중)`;
            }
            
            ingameStoneEl.style.backgroundImage = `url('${selectedStone.image}')`;
            
            document.getElementById('roulette-title').innerText = "SKIN READY!";
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

        // [★정밀 타격] 던지기 시작 시점: 무조건 인라인 스타일에 강제로 랜덤 게임 배경을 꽂아 넣습니다.
        const randomBg = gameBackgrounds[Math.floor(Math.random() * gameBackgrounds.length)];
        container.style.backgroundImage = `url('${randomBg}')`;

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
        const stepDuration = 380 * Math.pow(1 - progress, 2.5) + 35;
        
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

        ingameStoneEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
        ingameStoneEl.style.left = `${currentX}px`;
        ingameStoneEl.style.top = `${stoneRenderY}px`;

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
                
                // [★완공] 정산 후 루프 초기화 장치: 컨테이너의 배경을 다시 가챠용 배경으로 초기화합니다.
                container.style.backgroundImage = "none"; 
                rouletteScreen.style.display = 'flex';
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
    container.appendChild(point);

    const rip = document.createElement('div');
    rip.className = 'ripple';
    rip.style.left = `${x}px`;
    rip.style.top = `${y}px`;
    rip.style.borderColor = color;
    container.appendChild(rip);
}

updateAssetUI();