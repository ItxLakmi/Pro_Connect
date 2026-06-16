import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Skill Tests...');

  // 1. React Basics
  const reactTest = await prisma.skillTest.create({
    data: {
      title: 'React Fundamentals',
      description: 'Test your knowledge of React components, hooks, and state management.',
      skillTag: 'React',
      timeLimitMin: 5,
      passingScore: 75,
      questions: {
        create: [
          {
            question: 'What hook is used to manage local state in a functional component?',
            options: ['useEffect', 'useState', 'useReducer', 'useContext'],
            correctIndex: 1,
            order: 1
          },
          {
            question: 'Which of the following is NOT a rule of React Hooks?',
            options: ['Only call Hooks at the top level', 'Only call Hooks from React functions', 'Hooks can be called inside loops or conditions', 'Custom hooks should start with "use"'],
            correctIndex: 2,
            order: 2
          },
          {
            question: 'What is the purpose of useEffect?',
            options: ['To handle routing', 'To perform side effects in components', 'To manage global state', 'To optimize rendering speed'],
            correctIndex: 1,
            order: 3
          },
          {
            question: 'How do you pass data from a parent component to a child component?',
            options: ['Using Redux', 'Using State', 'Using Props', 'Using Context'],
            correctIndex: 2,
            order: 4
          }
        ]
      }
    }
  });

  // 2. Node.js Backend
  const nodeTest = await prisma.skillTest.create({
    data: {
      title: 'Node.js Backend Engineering',
      description: 'Verify your skills in building robust backend services with Node.js and Express.',
      skillTag: 'Node.js',
      timeLimitMin: 10,
      passingScore: 80,
      questions: {
        create: [
          {
            question: 'Which core module in Node.js is used to create a web server?',
            options: ['fs', 'http', 'path', 'url'],
            correctIndex: 1,
            order: 1
          },
          {
            question: 'What does "npm" stand for?',
            options: ['Node Package Manager', 'Node Project Manager', 'New Package Manager', 'Node Process Manager'],
            correctIndex: 0,
            order: 2
          },
          {
            question: 'How can you read environment variables in Node.js?',
            options: ['env.get()', 'process.env', 'global.env', 'system.env'],
            correctIndex: 1,
            order: 3
          }
        ]
      }
    }
  });

  console.log(`Seeded tests: ${reactTest.title}, ${nodeTest.title}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
