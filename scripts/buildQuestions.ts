import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Определяем __dirname в ES-модулях
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Answer {
  id: string;
  text: string;
}

interface Question {
  id: string;
  text: string;
  answers: Answer[];
  correctAnswerIds: string[];
  correctAnswerDescription?: string;
}

interface TopicMeta {
  title: string;
  description: string;
}

const QUESTIONS_ROOT = path.resolve(__dirname, "../public/questions");

function getAllJsonFiles(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  list.forEach((file) => {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(getAllJsonFiles(fullPath));
    } else if (file.isFile() && file.name.endsWith(".json")) {
      results.push(fullPath);
    }
  });
  return results;
}

function processQuestionsFile(filePath: string): Question[] {
  const rawData = fs.readFileSync(filePath, "utf-8");
  try {
    return JSON.parse(rawData);
  } catch (err) {
    console.error(`Ошибка парсинга JSON: ${filePath}`, err);
    return [];
  }
}

function buildAllQuestions(): { [topic: string]: Question[] } {
  const allFiles = getAllJsonFiles(QUESTIONS_ROOT);
  const result: { [topic: string]: Question[] } = {};

  allFiles.forEach((filePath) => {
    const relativePath = path.relative(QUESTIONS_ROOT, filePath);
    const parts = relativePath.split(path.sep);
    const topic = parts[0];

    if (parts[1] === "metadata.json") return; // пропускаем metadata.json

    const questions = processQuestionsFile(filePath);

    if (!result[topic]) {
      result[topic] = [];
    }

    result[topic] = result[topic].concat(questions);
  });

  return result;
}

function getTopics(): { name: string; title: string; description: string }[] {
  const dirs = fs.readdirSync(QUESTIONS_ROOT);
  const topics: { name: string; title: string; description: string }[] = [];

  dirs.forEach((dir) => {
    const dirPath = path.join(QUESTIONS_ROOT, dir);
    if (fs.statSync(dirPath).isDirectory()) {
      const metaFile = path.join(dirPath, "metadata.json");
      let title = dir;
      let description = "";

      try {
        if (fs.existsSync(metaFile)) {
          const metaDataRaw = fs.readFileSync(metaFile, "utf-8");
          const metaData: TopicMeta = JSON.parse(metaDataRaw);
          title = metaData.title || title;
          description = metaData.description || "";
        }
      } catch (e) {
        console.warn(`Ошибка чтения metadata.json для темы ${dir}:`, e);
      }

      topics.push({ name: dir, title, description });
    }
  });

  return topics;
}

function writeAllQuestionsFile() {
  const allQuestions = buildAllQuestions();
  const outPath = path.resolve(QUESTIONS_ROOT, "../allQuestions.json");
  fs.writeFileSync(outPath, JSON.stringify(allQuestions, null, 2), "utf-8");
  console.log(`Файл allQuestions.json записан: ${outPath}`);
}

function writeTopicsFile() {
  const topics = getTopics();
  const topicsPath = path.resolve(QUESTIONS_ROOT, "../topics.json");
  fs.writeFileSync(topicsPath, JSON.stringify(topics, null, 2), "utf-8");
  console.log(`Файл topics.json записан: ${topicsPath}`);
}

function main() {
  writeAllQuestionsFile();
  writeTopicsFile();
}

main();
