const image = new Image('./assets/Transition.png')
image.width = 44;
image.height = 44;

const { width: screenWidth, height: screenHeight } = Screen.getMode();

let maxScale = 3
let minScale = Math.fround(0.3)
let totalColumns = Math.ceil(screenWidth / image.width)
let totalRows = Math.ceil(screenHeight, image.height)
let transitionSpeed = Math.fround(0.05)
let isTransitioning = false;
let transitionProgress = 0;
let transitionPhase = 'fadeOut'
let onTransitionComplete = () => { };

let targetScreen = null;
let currentScreen = null;

function startTransition(fromScreen, toScreen, callback = null) {
    if (isTransitioning) return false;

    currentScreen = fromScreen;
    targetScreen = toScreen;
    onTransitionComplete = callback;
    isTransitioning = true;
    transitionProgress = 0;
    transitionPhase = 'fadeOut';

    return true;
}

function update() {
    if (!isTransitioning) return;

    transitionProgress = Math.min(1, transitionProgress + transitionSpeed);

    if (transitionPhase === 'fadeOut' && transitionProgress >= 0.5) {
        transitionPhase = 'fadeIn';
    }

    if (transitionProgress === 1) {
        completeTransition();
    }
}

function render() {
    if (!isTransitioning) return;

    if (transitionPhase === 'fadeOut') {
        if (currentScreen) {
            currentScreen.render();
        }
        const phaseProgress = Math.min(1, transitionProgress * 2);

        renderTransitionEffect(phaseProgress, 'fadeOut');
    }
    else if (transitionPhase === 'fadeIn') {
        if (targetScreen) {
            targetScreen.render();
        }

        const phaseProgress = Math.fround(Math.min(1, (transitionProgress - 0.5) * 2));

        renderTransitionEffect(phaseProgress, 'fadeIn');
    }
}

function renderTransitionEffect(phaseProgress, phase) {
    for (let col = 0; col < totalColumns; col++) {
        const columnX = col * columnWidth;

        const columnRelativePosition = col / Math.max(1, totalColumns - 1);
        let columnProgress = 0;

        if (phase === 'fadeOut') {
            const adjustedProgress = Math.fround(Math.max(0, phaseProgress * 1.5 - columnRelativePosition * 0.5));
            columnProgress = Math.min(1, adjustedProgress);
        } else {
            const adjustedProgress = Math.fround(Math.max(0, phaseProgress * 1.5 - columnRelativePosition * 0.5));
            columnProgress = Math.max(0, 1 - adjustedProgress);
        }

        if (columnProgress <= 0) continue;

        const easedProgress = easeInOutCubic(columnProgress);

        let scale;
        if (phase === 'fadeOut') {
            scale = minScale + (maxScale - minScale) * easedProgress;
        } else {
            scale = minScale + (maxScale - minScale) * easedProgress;
        }
        renderColumn(columnX, scale, easedProgress);
    }
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function renderColumn(columnX, scale, columnProgress) {
    const columnWidth = Math.min(columnWidth, screenWidth - columnX);

    for (let tileY = 0; tileY < totalRows; tileY++) {
        const y = tileY * tileHeight;
        const remainingHeight = Math.min(tileHeight, screenHeight - y);

        const tilesInColumn = Math.ceil(columnWidth / tileWidth);

        for (let tileIdx = 0; tileIdx < tilesInColumn; tileIdx++) {
            const tileX = columnX + (tileIdx * tileWidth);

            if (tileX >= columnX + columnWidth) break;

            const remainingWidth = Math.min(tileWidth, (columnX + columnWidth) - tileX);

            renderTile(tileX, y, remainingWidth, remainingHeight, scale, columnProgress);
        }
    }
}

function renderTile(x, y, width, height, scale, progress) {
    if (progress <= 0.01) return;

    const scaledWidth = tileWidth * scale;
    const scaledHeight = tileHeight * scale;

    const centerX = x + tileWidth / 2;
    const centerY = y + tileHeight / 2;
    const drawX = centerX - scaledWidth / 2;
    const drawY = centerY - scaledHeight / 2;

    if (width < tileWidth || height < tileHeight) {
        const widthRatio = Math.min(1, width / tileWidth);
        const heightRatio = Math.min(1, height / tileHeight);

        transitionImage.startx = 0;
        transitionImage.endx = tileWidth * widthRatio;
        transitionImage.starty = 0;
        transitionImage.endy = tileHeight * heightRatio;
        transitionImage.width = scaledWidth * widthRatio;
        transitionImage.height = scaledHeight * heightRatio;
    } else {
        transitionImage.startx = 0;
        transitionImage.endx = tileWidth;
        transitionImage.starty = 0;
        transitionImage.endy = tileHeight;
        transitionImage.width = scaledWidth;
        transitionImage.height = scaledHeight;
    }

    transitionImage.draw(drawX, drawY);
}

function completeTransition() {
    isTransitioning = false;
    transitionPhase = 'fadeOut';

    if (onTransitionComplete) {
        onTransitionComplete();
    }

    currentScreen = null;
    targetScreen = null;
    onTransitionComplete = null;
}

Screen.display(() => {
    ///working
})