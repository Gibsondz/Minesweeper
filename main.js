window.addEventListener('load', main);

let timer;

/**
 * creates enough cards for largest board (22x22)
 * registers callbacks for cards
 * 
 * @param {state} game
 */
function prepare_dom(game) {
  const grid = document.querySelector(".grid");
  const nCards = 22 * 22 ; // max grid size
  for( let i = 0 ; i < nCards ; i ++) {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("data-cardInd", i);
    card.addEventListener("click", () => {
      card_click_cb(game, i);
    });

    card.addEventListener("contextmenu", (event) => {
      card_flag_cb(game, i);
      event.preventDefault();
    });

    $(card).on("taphold", function(event){
      card_flag_cb(game, i);
    });
    $(card).off("taphold");
    
    grid.appendChild(card);
  }
}

/**
 * updates DOM to reflect current state
 * - hides unnecessary cards by setting their display: none
 * 
 * @param {state} game
 */
function render(game) {
  const grid = document.querySelector(".grid");
  grid.style.gridTemplateColumns = `repeat(${game.getStatus().ncols}, 1fr)`;
  for( let i = 0 ; i < grid.children.length ; i ++) {
    const card = grid.children[i];
    const ind = Number(card.getAttribute("data-cardInd"));
    if( ind >= game.getStatus().nrows * game.getStatus().ncols) {
      card.style.display = "none";
    }
    else {
      card.style.display = "block";
      let renderRow = game.getRendering()[Math.floor(ind/game.getStatus().ncols)];

      var renderChar = renderRow.charAt(Math.floor(ind%game.getStatus().ncols))

      stripAllClasses(card);
      if( renderChar === 'H')
      {
        //If H do nothing (default card)
      }
      else if( renderChar === '0')
      {
        card.classList.add('zero');
      }
      else if( renderChar === 'M')
      {
        card.classList.add("mine");
      }
      else if( renderChar == 'F')
      {
        card.classList.add("flag");
      }
      else // It is a number
      {
        switch(renderChar)
        {
          case '1':
            card.classList.add("one");
            break;
          case '2':
            card.classList.add("two");
            break;
          case '3':
            card.classList.add("three");
            break;
          case '4':
            card.classList.add("four");
            break;
          case '5':
            card.classList.add("five");
            break;
          case '6':
            card.classList.add("six");
            break;
          case '7':
            card.classList.add("seven");
            break;
          case '8':
            card.classList.add("theholyeight");
            break;
          default:
            console.log("This really should not happen");
            card.classList.add("theholyeight");
        }
      }
    }
  }

  document.querySelectorAll(".minecount").forEach( (e) => {
    e.innerHTML= game.getStatus().nmines - game.getStatus().nmarked;
  });
  
}

function stripAllClasses(card)
{
  card.classList.remove("mine");
  card.classList.remove("flag");
  card.classList.remove('zero');
  card.classList.remove('one');
  card.classList.remove('two');
  card.classList.remove('three');
  card.classList.remove('four');
  card.classList.remove('five');
  card.classList.remove('six');
  card.classList.remove('seven');
  card.classList.remove('theholyeight');
}

/**
 * callback for clicking a card
 * @param {state} game
 * @param {number} ind 
 */
function card_click_cb(game, ind) {
  const col = ind % game.getStatus().ncols;
  const row = Math.floor(ind / game.getStatus().ncols);

  game.uncover(row, col);
  render(game);

  // check if we won and activate overlay if we did
  if( game.getStatus().done === true ) {

    stopTimer();
    document.querySelector("#overlay").classList.toggle("active");

    if( game.getStatus().exploded === true )
    {
      document.querySelector(".big").textContent = "You Lost!";
    }
    else
    {
      document.querySelector(".big").innerHTML = "Congratulations, you won!!!"
    }
  }
  
}

/**
 * callback for right clicking or long pressing a card
 * - flag the card
 * @param {state} game
 * @param {number} ind 
 */
function card_flag_cb(game, ind) {
  const col = ind % game.getStatus().ncols;
  const row = Math.floor(ind / game.getStatus().ncols);

  game.mark(row, col);
  
  render(game);
}

/**
 * callback for the top button
 * - set the state to the requested size
 * - generate a solvable state
 * - render the state
 * 
 * @param {state} game
 * @param {number} rows 
 * @param {number} cols 
 */
function button_cb(game, rows, cols, bombs) {
  game.init(rows, cols, bombs);
  startTimer();

  render(game);
}

function startTimer()
{

  stopTimer();
  let sec = 0;
  function pad ( val ) { return val > 9 ? val : "0" + val; }
  timer = setInterval( function(){
      sec++;
      document.querySelectorAll(".seconds").forEach( (e) => {
        e.innerHTML=pad(sec%60);
      });

      document.querySelectorAll(".minutes").forEach( (e) => {
        e.innerHTML=pad(parseInt(sec/60,10));
      });

  }, 1000);
}

function stopTimer()
{
  clearInterval(timer);
}

function getBombAmount(cols)
{
  if(cols === 9)
  {
      bombs = 10;
  }
  else if(cols === 15)
  {
      bombs = 40;
  }  
  else
  {
      bombs = 99;
  }

  return bombs;
}

function main() {

  // create state object
  let game = new MSGame();
  
  // get browser dimensions - not used in thise code
  let html = document.querySelector("html");
  console.log("Your render area:", html.clientWidth, "x", html.clientHeight)
  
  // register callbacks for buttons
  document.querySelectorAll(".menuButton").forEach((button) =>{
    [rows,cols] = button.getAttribute("data-size").split("x").map(s=>Number(s));
    button.innerHTML = `${cols} &#x2715; ${rows}`
    button.addEventListener("click", button_cb.bind(null, game, rows, cols, getBombAmount(cols)));
  });

  // callback for overlay click - hide overlay and regenerate game
  document.querySelector("#overlay").addEventListener("click", () => {
    document.querySelector("#overlay").classList.remove("active");
    button_cb(game, game.getStatus().nrows, game.getStatus().ncols, getBombAmount(game.getStatus().ncols));
    render(game); 
  });

  // create enough cards for largest game and register click callbacks
  prepare_dom(game);

  // simulate pressing 9x9 button to start new game
  button_cb(game, 9, 9, 10);
}
