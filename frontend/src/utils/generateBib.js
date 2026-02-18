/**
 * Generates a BIB image using HTML Canvas by overlaying bib number and runner name
 * onto a template image (or a default styled BIB if no template provided).
 *
 * @param {string|null} templateUrl - URL/base64 of the BIB template image
 * @param {string} bibNumber - The BIB number to display
 * @param {string} runnerName - The runner's name to display
 * @param {string} challengeTitle - The challenge title (optional, shown at top)
 * @returns {Promise<string>} - base64 PNG data URL of the generated BIB
 */
export const generateBibImage = (templateUrl, bibNumber, runnerName, challengeTitle = '') => {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        const drawText = () => {
            // --- BIB Number (large, center) ---
            ctx.textAlign = 'center';
            ctx.fillStyle = '#1a1a2e';
            ctx.font = 'bold 120px "Arial Black", Arial, sans-serif';
            ctx.letterSpacing = '4px';
            // Shadow for depth
            ctx.shadowColor = 'rgba(0,0,0,0.3)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 4;
            ctx.fillText(bibNumber, 300, 240);

            // --- Runner Name ---
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;
            ctx.font = 'bold 32px Arial, sans-serif';
            ctx.fillStyle = '#1a1a2e';
            ctx.fillText(runnerName.toUpperCase(), 300, 300);

            // --- Challenge Title (top) ---
            if (challengeTitle) {
                ctx.font = 'bold 18px Arial, sans-serif';
                ctx.fillStyle = '#ffffff';
                ctx.fillText(challengeTitle.toUpperCase(), 300, 50);
            }

            resolve(canvas.toDataURL('image/png'));
        };

        if (templateUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                ctx.drawImage(img, 0, 0, 600, 400);
                drawText();
            };
            img.onerror = () => {
                // Fallback: draw default BIB background
                drawDefaultBackground(ctx, canvas);
                drawText();
            };
            img.src = templateUrl;
        } else {
            drawDefaultBackground(ctx, canvas);
            drawText();
        }
    });
};

function drawDefaultBackground(ctx, canvas) {
    // White BIB background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 600, 400);

    // Top color band (gradient)
    const topGrad = ctx.createLinearGradient(0, 0, 600, 0);
    topGrad.addColorStop(0, '#7c3aed');
    topGrad.addColorStop(1, '#0891b2');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, 600, 70);

    // Bottom color band
    const botGrad = ctx.createLinearGradient(0, 0, 600, 0);
    botGrad.addColorStop(0, '#7c3aed');
    botGrad.addColorStop(1, '#0891b2');
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, 330, 600, 70);

    // Decorative side stripes
    ctx.fillStyle = 'rgba(124,58,237,0.08)';
    ctx.fillRect(0, 70, 30, 260);
    ctx.fillRect(570, 70, 30, 260);

    // "SOLEMATES" watermark text
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.textAlign = 'center';
    for (let y = 100; y < 330; y += 40) {
        ctx.fillText('SOLEMATES  SOLEMATES  SOLEMATES', 300, y);
    }

    // Border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 580, 380);
}
