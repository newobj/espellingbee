import * as pr from 'pure-rand';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { HexGrid, Layout } from 'react-hexgrid';
import './App.css';
import Hex from './Hex';
import { palabras as palabras_denorm } from './Palabras-smaller';
import { puzzles } from './Puzzles';


//"https://w7.pngwing.com/pngs/65/699/png-transparent-bumblebee-man-grampa-simpson-fat-tony-mr-burns-bee-character-honey-bee-television-food-thumbnail.png"
const imgsrc = "https://static.simpsonswiki.com/images/thumb/1/17/Bumblebee_Man.png/250px-Bumblebee_Man.png"

let shuffleSalt = Math.random()
const palabras: string[] = []
const palabras_to_denorm = new Map<string, string>();
for (const word_denorm of palabras_denorm) {
  const palabra = word_denorm.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  palabras_to_denorm.set(palabra, word_denorm);
  palabras.push(palabra)
}

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(shuffleSalt * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array
}

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

function bold_panny(norm:string, denorm: string) {
  const letters = new Set<string>();
  for (const ch of norm) {
    letters.add(ch)
  }
  if (letters.size == 7 ) {
    return <text><a target="_blank" rel="noreferrer" href={"https://www.spanishdict.com/translate/"+norm}><b>{denorm}</b></a> </text>
  } else {
    return <text><a target="_blank" rel="noreferrer" href={"https://www.spanishdict.com/translate/"+norm}>{denorm}</a> </text>
  }
}

// generatePuzzles();

const cookieVersion = 25
const cookieSeed = "v" + cookieVersion + "_seed"
const cookieFound = "v" + cookieVersion + "_found"
const foundPuzzleWords = new Set<string>();
const puzzleWords = new Set<string>();

function App() {
  const [cookies, setCookie, removeCookie] = useCookies([cookieSeed, cookieFound]);
  const [guessedWord, setGuessedWord] = useState(new Array() as string[]);
  const [revealed, setRevealed] = useState(false);

  console.log(`cookie version = ${cookieVersion}`)

  // Restore state or start new state if new day
  const seedToday = Math.floor(new Date().getTime() / 86400 / 1000) + cookieVersion;
  console.log(`seedToday = ${seedToday}`)
  // setCookie(cookieSeed, cookies[cookieSeed] ?? seedToday, { path: '/' })
  // setCookie(cookieFound, cookies[cookieFound] ?? new Set<string>(), { path: '/' })
  if (cookies[cookieSeed] != seedToday) {
    console.log(`Existing seed ${cookies[cookieSeed]} != ${seedToday}, starting new day`)
    // New day, reset found list and set seed
    setCookie(cookieSeed, seedToday, { path: '/' })
    setCookie(cookieFound, [], { path: '/' })
    foundPuzzleWords.clear()
  }
  const rng = pr.mersenne(seedToday)

  const puzzle = puzzles[seedToday % puzzles.length];
  const puzzleLetters: string[] = []
  for (const c of puzzle) {
    puzzleLetters.push(c)
  }
  const [rn, _] = rng.next()
  const requiredLetterIndex = Math.floor(rn % puzzleLetters.length)
  console.log(`Required letter index = ${requiredLetterIndex}`)
  const requiredLetter = puzzleLetters[requiredLetterIndex];
  console.log(`Required letter  = ${requiredLetter}`)
  shuffleArray(puzzleLetters);
  let puzzleWordCount = 0;
  for (const word of palabras) {
    if (word.length < 4) continue;
    if (isWordInClass(word, puzzle) && word.indexOf(requiredLetter) > -1) {
      puzzleWordCount++;
      puzzleWords.add(word);
    }
  }
  const optionalLetters = puzzleLetters.filter((l) => { return l !== requiredLetter } )
  // console.log(`Parsing json : ${json} (${typeof json} ${json.constructor.name})`)
  for (const found of cookies[cookieFound] ?? []) {
    foundPuzzleWords.add(found)
    puzzleWords.delete(found)
  }
  function deleteCharacter() {
    let newGuessedWord = Array.from(guessedWord)
    if (newGuessedWord.length > 0) {
      newGuessedWord.pop();
      setGuessedWord(newGuessedWord)
    }
  }
  function shuffleLetters() {
    shuffleSalt = Math.random()
    console.log(`shuffle salt = ${shuffleSalt}`)
    let newGuessedWord = Array.from(guessedWord)
    setGuessedWord(newGuessedWord)
  }
  function enterGuess() {
    const guess = guessedWord.join("").toLowerCase();
    if (puzzleWords.has(guess)) {
      puzzleWords.delete(guess);
      foundPuzzleWords.add(guess);
      setCookie(cookieFound, Array.from(foundPuzzleWords), { path: '/' })
    }
    console.log(`your guess is ${guess}`)
    setGuessedWord([])
  }
  function toggleReveal() {
    setRevealed(!revealed)
  }
  function enterLetter(key: string) {
    let newGuessedWord = Array.from(guessedWord)
    newGuessedWord.push(key.toUpperCase())
    setGuessedWord(newGuessedWord)
  }
  function handleKeyPress(ev: KeyboardEvent) {
    console.log("You pressed a key.")
    if (ev.key == "Backspace") {
      deleteCharacter()
    } else if (ev.key == ' ') {
      shuffleLetters()
    } else if (ev.key == "Enter") {
      enterGuess()
    } else if (String.fromCharCode(ev.keyCode).match(/(\w)/g)) {
      enterLetter(ev.key)
    } else {
      return
    }
  }
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    }
  });
  function spoilers() {
    if (revealed) {
      return <div className="spoilers">
        <br></br>
        Remaining words :<br></br> {Array.from(puzzleWords).map((w) => bold_panny(w, palabras_to_denorm.get(w)!))}
      </div>
    } else {
      return <></>
    }
  }

  // <a target="_blank" rel="noreferrer" href={"https://www.spanishdict.com/translate/"+word}>{word} (class={wordClass})</a>
  return (
    <div className="App">
      <header className="App-header">
        <div className="guess">&nbsp;{guessedWord.join("")}</div>
        <HexGrid viewBox="-35 -35 70 70">
          {/* Grid with manually inserted hexagons */}
          <Layout size={{ x: 10, y: 10 }} flat={true} spacing={1.1} origin={{ x: 0, y: 0 }}>
            <Hex q={0} r={0} s={0} onClick={() => {enterLetter(requiredLetter)}} letter={requiredLetter} primary={true} />
            <Hex q={0} r={-1} s={1} onClick={() => {enterLetter(optionalLetters[0])}} letter={optionalLetters[0]} />
            <Hex q={0} r={1} s={-1} onClick={() => {enterLetter(optionalLetters[1])}} letter={optionalLetters[1]} />
            <Hex q={1} r={-1} s={0} onClick={() => {enterLetter(optionalLetters[2])}} letter={optionalLetters[2]} />
            <Hex q={1} r={0} s={-1} onClick={() => {enterLetter(optionalLetters[3])}} letter={optionalLetters[3]} />
            <Hex q={-1} r={1} s={0} onClick={() => {enterLetter(optionalLetters[4])}} letter={optionalLetters[4]} />
            <Hex q={-1} r={0} s={1} onClick={() => {enterLetter(optionalLetters[5])}} letter={optionalLetters[5]} />
          </Layout>
        </HexGrid>
        <table>
          <tr>
            <td><button onClick={deleteCharacter}>Delete</button></td>
            <td><button onClick={shuffleLetters}>↺</button></td>
            <td><button onClick={enterGuess}>Enter</button></td>
          </tr>
        </table>
      </header>
      <header className="App-wordlist">
        <img src={imgsrc}></img>
        You have found {foundPuzzleWords.size}/{foundPuzzleWords.size + puzzleWords.size} words :
        <div className="found">
          {Array.from(foundPuzzleWords).map((w) => bold_panny(w, palabras_to_denorm.get(w)!))}
        </div>
        {spoilers()}
        <br></br>
        <button onClick={toggleReveal}>Reveal All Words</button>
        <hr></hr>
      </header>
    </div>
  );
}

export default App;

// 🎲