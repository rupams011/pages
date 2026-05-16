import { colord } from 'colord';

export interface ExportSettings {
    name: string;
    width: number;
    height: number;
    orientation: 'horizontal' | 'vertical';
    format: 'png' | 'jpg' | 'svg';
}

export const generatePaletteExport = async (
    palette: string[], 
    settings: ExportSettings, 
    iconSrc: string
) => {
    const { name, width, height, orientation, format } = settings;

    if (!palette || palette.length === 0) throw new Error("No palette to export");

    if (format === 'svg') {
        const footerH = 100;
        const paletteH = height - footerH;
        let content = '';
        const count = palette.length;

        if (orientation === 'vertical') {
            const itemW = width / count;
            palette.forEach((hex, i) => {
                content += `<rect x="${i * itemW}" y="0" width="${itemW}" height="${paletteH}" fill="${hex}" />`;
                content += `<text x="${i * itemW + itemW/2}" y="${paletteH - 20}" font-family="sans-serif" font-size="20" fill="${colord(hex).isLight() ? 'black' : 'white'}" text-anchor="middle">${hex}</text>`;
            });
        } else {
            const itemH = paletteH / count;
            palette.forEach((hex, i) => {
                content += `<rect x="0" y="${i * itemH}" width="${width}" height="${itemH}" fill="${hex}" />`;
                content += `<text x="${width/2}" y="${i * itemH + itemH/2}" font-family="sans-serif" font-size="20" fill="${colord(hex).isLight() ? 'black' : 'white'}" text-anchor="middle" dominant-baseline="middle">${hex}</text>`;
            });
        }

        content += `<rect x="0" y="${paletteH}" width="${width}" height="${footerH}" fill="white" />`;
        content += `<text x="20" y="${paletteH + 60}" font-family="sans-serif" font-size="30" font-weight="bold" fill="black">HueSurge</text>`;
        content += `<text x="${width - 20}" y="${paletteH + 60}" font-family="sans-serif" font-size="24" fill="gray" text-anchor="end">${name}</text>`;

        const svgData = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${content}</svg>`;
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${name.replace(/\s+/g, '-').toLowerCase()}.svg`;
        link.click();
    } else {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error("Canvas context failed");
        
        const footerH = 100;
        const paletteH = height - footerH;
        const count = palette.length;
        
        palette.forEach((hex, i) => {
            ctx.fillStyle = hex;
            if (orientation === 'vertical') {
                const w = width / count;
                const x = i * w;
                ctx.fillRect(x, 0, w, paletteH);
                ctx.fillStyle = colord(hex).isLight() ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)';
                ctx.font = 'bold 24px monospace';
                ctx.textAlign = 'center';
                ctx.fillText(hex, x + w/2, paletteH - 30);
            } else {
                const h = paletteH / count;
                const y = i * h;
                ctx.fillRect(0, y, width, h);
                ctx.fillStyle = colord(hex).isLight() ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)';
                ctx.font = 'bold 24px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(hex, width/2, y + h/2);
            }
            ctx.textBaseline = 'alphabetic';
        });

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, paletteH, width, footerH);

        const img = new Image();
        img.src = iconSrc; 
        try {
                await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = resolve; // Continue even if fails
            });
            const logoSize = 60;
            const logoY = paletteH + (footerH - logoSize)/2;
            ctx.drawImage(img, 20, logoY, logoSize, logoSize);
        } catch(e) {}

        ctx.fillStyle = '#000000';
        ctx.font = 'bold 40px sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText('HueSurge', 100, paletteH + footerH/2);

        ctx.fillStyle = '#666666';
        ctx.font = '30px sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(name, width - 30, paletteH + footerH/2);

        const link = document.createElement('a');
        link.download = `${name.replace(/\s+/g, '-').toLowerCase()}.${format}`;
        link.href = canvas.toDataURL(`image/${format}`, 0.9);
        link.click();
    }
};
