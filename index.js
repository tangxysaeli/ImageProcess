const fs = require('fs');
const path = require('path');
const gm = require('gm');

let _dir = 'imgs';
let output = 'output';
function setDir(dir) {
    _dir = dir;
}
function setOutput(dir) {
    output = dir;
}
const images = [];
function getImages(dir) {
    if (!fs.existsSync(path.join(__dirname, dir))) {
        return [];
    }
    // 遍历某文件夹下的所有文件
    fs.readdirSync(path.join(__dirname, dir)).forEach((file) => {
        if (/\.(jpg|png)$/.test(file)) {
            images.push(path.join(dir, file));
        }
        if (fs.statSync(path.join(__dirname, dir, file)).isDirectory()) {
            getImages(path.join(dir, file));
        }
    });
}

function collapseLR(left, right, target) {
    return new Promise((r, j) => {
        gm(left).append(right, true).write(target, err => {
            r();
        });
    });
}
function collapseUD(up, down, target) {
    return new Promise((r, j) => {
        gm(up).append(down).write(target, err => {
            r();
        });
    })
}

async function createImage() {
    getImages(_dir);
    for (let i = 0; i < images.length; i++) {
        if (i % 4 === 0) {
            await collapseLR(
                images[i],
                images[i + 1],
                path.join(__dirname, output, i + 'u.jpg')
            );
            await collapseLR(
                images[i + 2],
                images[i + 3],
                path.join(__dirname, output, i + 'd.jpg')
            );
            await collapseUD(
                path.join(__dirname, output, i + 'u.jpg'),
                path.join(__dirname, output, i + 'd.jpg'),
                path.join(__dirname, output, i + '.jpg')
            );
        }
    }
    // 删除*u.jpg和*d.jpg
    fs.readdirSync(path.join(__dirname, output)).forEach((file) => {
        if (/d.jpg$/.test(file) || /u.jpg$/.test(file)) {
            fs.unlinkSync(path.join(__dirname, output, file));
        }
    });
    process.exit(0);
}

// node参数
setDir(process.argv[2] || 'imgs');
setOutput(process.argv[3] || output);
fs.readdirSync(path.join(__dirname, output)).forEach((file) => {
    if (/d.jpg$/.test(file) || /u.jpg$/.test(file)) {
        fs.unlinkSync(path.join(__dirname, output, file));
    }
});
createImage();

