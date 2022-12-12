import { useEffect, useState } from 'react';
import { HexGrid, Layout } from 'react-hexgrid';
import './App.css';
import Hex from './Hex';
import { palabras as palabras_denorm } from './Palabras-smaller';
import { puzzles } from './Puzzles';

//"https://w7.pngwing.com/pngs/65/699/png-transparent-bumblebee-man-grampa-simpson-fat-tony-mr-burns-bee-character-honey-bee-television-food-thumbnail.png"
const imgsrc = "https://static.simpsonswiki.com/images/thumb/1/17/Bumblebee_Man.png/250px-Bumblebee_Man.png"

const palabras: string[] = []
const palabras_to_denorm = new Map<string, string>();
for (const word_denorm of palabras_denorm) {
  const palabra = word_denorm.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  palabras_to_denorm.set(palabra, word_denorm);
  palabras.push(palabra)
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array
}

const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
const puzzleLetters: string[] = []
for (const c of puzzle) {
  puzzleLetters.push(c)
}
shuffleArray(puzzleLetters);
const requiredLetter = puzzleLetters[0];
let puzzleWordCount = 0;
const puzzleWords =  new Set<string>();
for (const word of palabras) {
  if (word.length < 4) continue;
  if (isWordInClass(word, puzzle) && word.indexOf(requiredLetter) > -1) {
    puzzleWordCount++;
    puzzleWords.add(word);
  }
}
const foundPuzzleWorlds = new Set<string>();

function randomWord() {
  const numWords = palabras.length;
  const word = palabras[Math.floor(Math.random() * numWords)];
  console.log(`numWords = ${numWords} word = ${word}`)
  return word;
}

function getUniqueSortedLetters(letters: Set<string>) {
  return Array.from(letters).sort((l, r) => { return l.localeCompare(r); });
}

function getWordClass(word: string) {
  const wordClassSet = new Set<string>();
  for (const c of word) {
    wordClassSet.add(c);
  }
  return getUniqueSortedLetters(wordClassSet).join("");
}

function isWordInClass(word: string, wordClass: string) {
  const wordClassSet = new Set<string>();
  for (const c of wordClass) {
    wordClassSet.add(c);
  }
  for (const c of word) {
    if (!wordClassSet.has(c)) {
      return false;
    }
  }
  return true;
}

function generatePuzzles() {
  const wordClasses = new Set<string>();
  console.log(`Word classes = ${wordClasses}`)
  for (const word of palabras) {
    if (word.length < 4) continue;
    const wordClass = getWordClass(word);
    if (wordClass.length !== 7) continue;
    wordClasses.add(wordClass);
  }
  // console.log(`There are ${wordClasses.size} word classes`);
  // console.log(`Chosen word class = ${wordClass}`)
  let wordClassIdx = 0;
  const goodWordClass = new Set<string>();
  console.log(`Looking for good word classes`)
  wordClasses.forEach((wordClass) => {
    const puzzleWords = new Set<string>();
    for (const word of palabras) {
      if (word.length < 4) continue;
      if (isWordInClass(word, wordClass)) {
        puzzleWords.add(word)
      }
      if (puzzleWords.size > 60) break;
    }
    if (puzzleWords.size > 10 && puzzleWords.size <= 60) {
      goodWordClass.add(wordClass);
    }
    if (wordClassIdx % 100 == 0) {
      console.log(`Examining ${wordClassIdx}/${wordClasses.size}`)
    }
    wordClassIdx++;
  })
  console.log(`Found ${goodWordClass.size} good word classes = ${Array.from(goodWordClass)}`)
  // console.log(`There are ${Array.from(puzzleWords).length} words.`)
  // console.log(`Words = ${Array.from(puzzleWords).join(", ")}`)
}

// generatePuzzles();

function App() {
  const [guessedWord, setGuessedWord] = useState(new Array() as string[]);
  function handleKeyPress(ev: KeyboardEvent) {
    console.log("You pressed a key.")
    let newGuessedWord = Array.from(guessedWord)
    if (ev.key == "Backspace") {
      if (newGuessedWord.length > 0) {
        newGuessedWord.pop();
      }
    } else if (ev.key == "Enter") {
      const guess = guessedWord.join("").toLowerCase();
      if (puzzleWords.has(guess)) {
        puzzleWords.delete(guess);
        foundPuzzleWorlds.add(guess);
      }
      console.log(`your guess is ${guess}`)
      setGuessedWord([])
      return;
    } else if (String.fromCharCode(ev.keyCode).match(/(\w)/g)) {
      newGuessedWord.push(ev.key.toUpperCase())
    }
    setGuessedWord(newGuessedWord)
  }
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    }
  });

  // <a target="_blank" rel="noreferrer" href={"https://www.spanishdict.com/translate/"+word}>{word} (class={wordClass})</a>
  return (
    <div className="App">
      <header className="App-header">
        <div className="guess">&nbsp;{guessedWord.join("")}</div>
        <HexGrid height={800} viewBox="-50 -50 100 100">
          {/* Grid with manually inserted hexagons */}
          <Layout size={{ x: 10, y: 10 }} flat={true} spacing={1.1} origin={{ x: 0, y: 0 }}>
            <Hex q={0} r={0} s={0} letter={puzzleLetters[0]} primary={true} />
            <Hex q={0} r={-1} s={1} letter={puzzleLetters[1]} />
            <Hex q={0} r={1} s={-1} letter={puzzleLetters[2]} />
            <Hex q={1} r={-1} s={0} letter={puzzleLetters[3]} />
            <Hex q={1} r={0} s={-1} letter={puzzleLetters[4]} />
            <Hex q={-1} r={1} s={0} letter={puzzleLetters[5]} />
            <Hex q={-1} r={0} s={1} letter={puzzleLetters[6]} />
          </Layout>
        </HexGrid>
      </header>
      <header className="App-wordlist">
        <img src={imgsrc}></img>
        You have found {foundPuzzleWorlds.size}/{puzzleWordCount} words : {Array.from(foundPuzzleWorlds).map((w) => palabras_to_denorm.get(w)).join(" ")}
        <div className="spoilers">
        {Array.from(puzzleWords).map((w) => palabras_to_denorm.get(w)).join(" ")}
        </div>
        <hr></hr>
      </header>
    </div>
  );
}

export default App;
