export const DISEASE_MAPS = {
  rice: ["bacterialblight", "blast", "brownspot", "tungro"],
  potato: ["early_blight", "healthy", "late_blight"],
  tomato: ["bacterial_spot", "early_blight", "healthy", "late_blight", "leaf_mold", "septoria_leaf_spot", "spider_mites_two-spotted_spider_mite", "target_spot", "tomato_mosaic_virus", "tomato_yellow_leaf_curl_virus"],
  maize: ["cercospora_leaf_spot_gray_leaf_spot", "common_rust", "healthy", "northern_leaf_blight"],
  mango: ["anthracnose", "bacterial_canker", "cutting_weevil", "die_back", "gall_midge", "healthy", "powdery_mildew", "sooty_mould"],
  jackfruit: ["Algal_Leaf_Spot_of_Jackfruit", "Black_Spot_of_Jackfruit", "Healthy_Leaf_of_Jackfruit"],
  guava: ["Canker", "Dot", "Healthy", "Mummification", "Rust"],
  citrus: ["Citrus_Canker_Diseases_Leaf_Orange", "Citrus_Nutrient_Deficiency_Yellow_Leaf_Orange", "Healthy_Leaf_Orange", "Multiple_Diseases_Leaf_Orange", "Young_Healthy_Leaf_Orange"]
};

export const CROPS = [
  { id: 'rice', name: 'Rice / ধান', icon: 'Sprout' },
  { id: 'potato', name: 'Potato / আলু', icon: 'Leaf' },
  { id: 'tomato', name: 'Tomato / টমেটো', icon: 'Leaf' },
  { id: 'maize', name: 'Maize / ভুট্টা', icon: 'Sprout' },
  { id: 'mango', name: 'Mango / আম', icon: 'Trees' },
  { id: 'jackfruit', name: 'Jackfruit / কাঁঠাল', icon: 'Trees' },
  { id: 'guava', name: 'Guava / পেয়ারা', icon: 'Trees' },
  { id: 'citrus', name: 'Citrus / লেবু', icon: 'Trees' }
];

export function checkImageBlur(canvas) {
  try {
    const checkCanvas = document.createElement('canvas');
    const cw = 200;
    const ch = Math.floor(canvas.height * (cw / canvas.width));
    checkCanvas.width = cw;
    checkCanvas.height = ch;
    const checkCtx = checkCanvas.getContext('2d');
    checkCtx.drawImage(canvas, 0, 0, cw, ch);

    const imgData = checkCtx.getImageData(0, 0, cw, ch);
    const data = imgData.data;
    const grayscale = new Float32Array(cw * ch);

    for (let i = 0; i < data.length; i += 4) {
      grayscale[i / 4] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    }

    let mean = 0;
    let count = 0;
    const laplacians = new Float32Array((cw - 2) * (ch - 2));

    for (let y = 1; y < ch - 1; y++) {
      for (let x = 1; x < cw - 1; x++) {
        const idx = y * cw + x;
        const laplacian = grayscale[(y - 1) * cw + x] + grayscale[(y + 1) * cw + x] + grayscale[y * cw + (x - 1)] + grayscale[y * cw + (x + 1)] - 4 * grayscale[idx];
        laplacians[count++] = laplacian;
        mean += laplacian;
      }
    }
    mean /= count;
    let variance = 0;
    for (let i = 0; i < count; i++) {
      variance += Math.pow(laplacians[i] - mean, 2);
    }
    variance /= count;

    return variance >= 30;
  } catch (e) {
    console.warn("Blur check failed, skipping", e);
    return true;
  }
}
