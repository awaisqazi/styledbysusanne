// One-off: write image-recognition element tags into instagram-posts.json.
// Kept in the repo as the record of the initial tagging pass; edit the map
// and re-run to adjust tags. New posts get elements via their add spec.
import { readFile, writeFile } from 'node:fs/promises';
import { DATA_PATH } from './lib/instagram.mjs';

const ELEMENTS = {
  DbMQkRaiICA: ['mustard', 'yellow', 'orange', 'green', 'white', 'polka-dots', 'matching-set', 'tube-top', 'maxi-skirt', 'waist-scarf', 'scarf', 'floral', 'sweater-over-shoulders', 'beaded-bag', 'novelty-bag', 'platform-sandals'],
  DbIv4jIu9Kl: ['red', 'white', 'stripes', 'floral', 'print-mix', 'button-down', 'mini-skirt', 'brooch', 'quilted-bag', 'chain-bag', 'heels'],
  Da2tvufuO1E: ['white', 'cream', 'orange', 'tan', 'sundress', 'midi-dress', 'dress', 'sweater-over-shoulders', 'waist-scarf', 'scarf', 'floral', 'platform-sandals', 'raffia', 'shoulder-bag'],
  'DaxkSE-uSIW': ['white', 'green', 'orange', 'vest', 'mini-skirt', 'skirt', 'floral', 'neck-scarf', 'scarf', 'quilted-bag', 'chain-bag', 'kitten-heels', 'heels'],
  Davb0iDOqg3: ['pink', 'blush', 'cream', 'bodysuit', 'balloon-hem-pants', 'pants', 'wide-leg-pants', 'sweater-over-shoulders', 'waist-scarf', 'scarf', 'floral', 'quilted-bag', 'chain-bag', 'mesh-flats', 'flats'],
  DaYNd4AOvbG: ['red', 'tan', 'cream', 'mini-dress', 'dress', 'eyelet', 'lace', 'platform-sandals', 'raffia', 'shoulder-bag', 'gold-jewelry'],
  DZclbaxONP5: ['white', 'pastel', 'pink', 'multicolor', 'turtleneck', 'knit-top', 'maxi-skirt', 'skirt', 'quilted-bag', 'chain-bag', 'heels'],
  DZaAFJDug9b: ['white', 'brown', 'red', 'button-down', 'vest', 'sweater-over-shoulders', 'brooch', 'leopard', 'track-pants', 'pants', 'stripes', 'quilted-bag', 'chain-bag'],
  DZXcKagOUTj: ['white', 'pink', 'multicolor', 'dress', 'mini-dress', 'sweater-over-shoulders', 'waist-scarf', 'scarf', 'brooch', 'quilted-bag', 'chain-bag', 'kitten-heels', 'heels'],
  DZKlkx1uPr8: ['white', 'cream', 'yellow', 'light-blue', 'cardigan', 'sweater', 'mini-skirt', 'skirt', 'floral', 'neck-scarf', 'scarf', 'quilted-bag', 'chain-bag', 'mary-janes', 'socks', 'flats'],
  'DY-kjSsihw7': ['multicolor', 'orange', 'cream', 'white', 'knit-top', 'tank', 'crop-top', 'jeans', 'wide-leg-pants', 'pants', 'belt', 'beaded-bag', 'novelty-bag', 'sandals', 'gold-jewelry'],
  DY4gfwMuRJj: ['red', 'pink', 'bodysuit', 'mini-skirt', 'skirt', 'floral', 'quilted-bag', 'chain-bag', 'heels', 'gold-jewelry'],
  DY29yo5OTU2: ['pink', 'blush', 'white', 'cream', 'maxi-dress', 'dress', 'floral', 'sweater-over-shoulders', 'shoulder-bag', 'platform-sandals', 'raffia'],
  DYsFDqVOOFF: ['light-blue', 'blue', 'white', 'cream', 'tan', 'button-down', 'stripes', 'corset', 'mini-skirt', 'skirt', 'brooch', 'shoulder-bag', 'heels'],
  DYmhoIWu0Uj: ['navy', 'white', 'red', 'stripes', 'button-down', 'vest', 'mini-skirt', 'skirt', 'quilted-bag', 'chain-bag', 'mary-janes', 'socks'],
  DYj6V3JORT1: ['pink', 'hot-pink', 'white', 'stripes', 'button-down', 'vest', 'mini-skirt', 'skirt', 'floral', 'print-mix', 'brooch', 'quilted-bag', 'chain-bag', 'heels'],
  DYhXNecOY7T: ['white', 'light-blue', 'blue', 'sage', 'green', 'stripes', 'blazer', 'blouse', 'bow', 'brooch', 'mini-skirt', 'skirt', 'floral', 'print-mix', 'shoulder-bag', 'mary-janes'],
  DYeuvu2jngx: ['orange', 'yellow', 'lavender', 'pink', 'mini-dress', 'dress', 'strapless', 'halter', 'floral', 'beaded-bag', 'novelty-bag', 'straw-bag', 'platform-sandals', 'mules', 'gold-jewelry'],
  DYCh4XLjoGS: ['sage', 'green', 'cream', 'tan', 'brown', 'bodysuit', 'midi-skirt', 'skirt', 'leather', 'belt', 'neck-scarf', 'scarf', 'shoulder-bag', 'boots', 'knee-high-boots', 'coat', 'plaid'],
  DXwZex0jpOs: ['taupe', 'cream', 'white', 'sweater', 'maxi-skirt', 'skirt', 'belt', 'neck-scarf', 'scarf', 'shoulder-bag', 'boots', 'monochrome'],
  DXoncewDvOZ: ['white', 'tan', 'pink', 'blouse', 'lace', 'eyelet', 'floral', 'pants', 'jeans', 'stripes', 'button-down', 'neck-scarf', 'scarf', 'belt', 'shoulder-bag', 'mesh-flats', 'flats', 'mary-janes'],
  DXWi0XkDsa5: ['white', 'cream', 'brown', 'vest', 'maxi-skirt', 'skirt', 'leather', 'coat', 'faux-fur', 'shoulder-bag', 'heels', 'gold-jewelry'],
  DXMcgpYDmgT: ['white', 'cream', 'black', 'red', 'knit-top', 'neck-scarf', 'scarf', 'leather', 'skirt', 'maxi-skirt', 'quilted-bag', 'chain-bag', 'heels', 'belt'],
  DXJy3gUuvCP: ['green', 'blue', 'white', 'brown', 'tweed', 'blazer', 'jacket', 'stripes', 'button-down', 'neck-scarf', 'scarf', 'jeans', 'pants', 'belt', 'shoulder-bag', 'boots'],
  DXEg5c7ubS8: ['cream', 'green', 'olive', 'orange', 'knit-top', 'neck-scarf', 'scarf', 'leather', 'midi-skirt', 'skirt', 'tote-bag', 'boots'],
  DXCPPlSDmOx: ['red', 'brown', 'blue', 'knit-top', 'jacket', 'suede', 'neck-scarf', 'scarf', 'jeans', 'pants', 'belt', 'shoulder-bag', 'mules', 'boots'],
  'DW87NodDoJ_': ['tan', 'cream', 'white', 'orange', 'brown', 'stripes', 'button-down', 'neck-scarf', 'scarf', 'jeans', 'pants', 'belt', 'shoulder-bag', 'mules', 'suede', 'trench-coat', 'coat', 'sweater-over-shoulders', 'crossbody-bag'],
  DW6LLI2DvmX: ['blue', 'lavender', 'pink', 'white', 'tweed', 'matching-set', 'blazer', 'jacket', 'mini-skirt', 'skirt', 'button-down', 'bow', 'brooch', 'socks', 'loafers', 'shoulder-bag'],
  DW3eH0bjiJ2: ['navy', 'green', 'cream', 'tan', 'plaid', 'blazer', 'dress', 'mini-dress', 'neck-scarf', 'scarf', 'socks', 'loafers', 'tote-bag', 'trench-coat', 'coat'],
  DW08bYNDoeN: ['cream', 'tan', 'black', 'pink', 'hat', 'trench-coat', 'coat', 'sweater-over-shoulders', 'tank', 'leggings', 'crossbody-bag', 'sneakers'],
  DWwI49eDrHJ: ['green', 'olive', 'black', 'cardigan', 'knit-top', 'leather', 'pants', 'leopard', 'jeans', 'wide-leg-pants', 'belt', 'shoulder-bag', 'heels', 'novelty-bag', 'beaded-bag', 'boots'],
  DWrWLi3jrrS: ['pink', 'hot-pink', 'green', 'cream', 'eyelet', 'maxi-dress', 'dress', 'cardigan', 'gingham', 'scarf', 'clutch', 'kitten-heels', 'heels', 'mules', 'bow', 'gold-jewelry'],
  'DWllV-TDi7C': ['brooch', 'socks', 'scarf', 'neck-scarf', 'gold-jewelry'],
  DWi9d3HDqyb: ['cream', 'tan', 'neutrals', 'flatlay'],
  DWjY7iFDrPW: ['white', 'brown', 'jeans', 'wide-leg-pants', 'pants', 'blouse', 'eyelet', 'lace', 'belt', 'scarf', 'neck-scarf', 'mules', 'gold-jewelry'],
};

const posts = JSON.parse(await readFile(DATA_PATH, 'utf8'));
let applied = 0;
for (const post of posts) {
  const elements = ELEMENTS[post.id];
  if (!elements) {
    console.warn(`No elements defined for ${post.id}`);
    continue;
  }
  post.elements = elements;
  applied++;
}
await writeFile(DATA_PATH, `${JSON.stringify(posts, null, 2)}\n`);
console.log(`Applied elements to ${applied}/${posts.length} posts.`);
