import fs from "fs/promises";

const randomPrompt = () => {
  const prompts = [
    "Mechanical gears fused with human anatomy",
    "Anchor with nautical rope and compass",
    "Sun and moon intertwined, glowing",
    "Batman silhouette against a Gotham skyline",
    "Compass surrounded by ocean waves",
    "Scorpion with sharp, detailed claws",
    "Tiger with intense eyes in a jungle",
    "Spiral galaxy with stars and planets",
    "Angel wings with detailed feathers",
    "Samurai with a katana",
    "Futuristic cyberpunk girl with neon accents",
    "Athena, the goddess of war, fire",
    "Fierce Viking with intricate helmet design",
    "Majestic dragon coiled around a sword",
    "Howling wolf under a full moon",
    "Anchor entwined with roses and thorns",
    "Skull with roses and clock elements",
    "The Joker with a menacing smile",
    "Roaring lion with a flowing mane",
    "Butterfly with intricate wing patterns",
    "Simple triangle with a line through",
    "Rising phoenix with vibrant fiery wings",
    "Mountain range with a rising sun",
    "Hourglass with sand and skulls",
    "Tree of life with roots and branches"
  ];

  return prompts[Math.floor(Math.random() * prompts.length)];
}

const randomGender = () => {
  const genders = ["female woman", "male man"];
  return genders[Math.floor(Math.random() * genders.length)];
}

const randomBodyPart = () => {
  const bodyParts = ["back", "chest", "shoulder", "arm", "hand", "leg", "foot"];
  return bodyParts[Math.floor(Math.random() * bodyParts.length)];
}

const bodyPart = randomBodyPart();
const randomPromptDev = `A highly detailed on ${bodyPart} skin, ${bodyPart} tattoo body part tattoo of ${randomPrompt()}, is in color tattoo, use a realistic colors ,  on ${randomGender()} body. highly detailed tattoo, highly detailed tattoo, highly detailed tattoo, highly detailed tattoo, coherent and cohesive tattoo design, hide the nipples, don't show nipples`

console.log(randomPromptDev);
