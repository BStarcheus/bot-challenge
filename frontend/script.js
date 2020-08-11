const labels = {
    0: "Hummly",
    1: "Hummel",
    2: "Hummster"
};

// Image sizing
const height = 20;
const width = 20;

const numQuestions = 5;
var currentQuestion = 0;

// Page elements
const startBtn = document.getElementById('start');
const tryAgainBtn = document.getElementById('tryAgain');
const answerBtns = document.getElementsByClassName('quiz-ans-btn');
const quizMsg = document.getElementById('quiz-msg');
const quizContent = document.getElementById("quiz-content");
const timer = document.getElementById("timer");
const progress = document.getElementById("progress");

// Page setup
sampleData();
startBtn.addEventListener('click', nextQuestion);
tryAgainBtn.addEventListener('click', restartQuiz);
for (let i = 0; i < answerBtns.length; i++) {
    answerBtns[i].addEventListener('click', nextQuestion);
}

// Quiz setup
var testImages = [];
var testImgBinData = [];
var userAnswers = [];
var correctAnswers = [];

var timerInterval;


function sampleData() {
    const dataEq = [
        ["col > 0.5960038736698139*(row - 10)**2 + -2", 0],
        ["col < 1.2556765192766908*(row - 10)**2 + 2", 0],
        ["col > Math.abs(0.7295745556442257*(row - 10)) + 0", 1],
        ["col < Math.abs(1.9117979445533935*(row - 10)) + -2", 1],
        ["col > Math.abs(2.8332835820075175*(row - 10)) + 1.5*Math.sin(row - 10) + -4", 2],
        ["col < Math.abs(1.5241597066405626*(row - 10)) + 1.5*Math.sin(row - 10) + 4", 2]
    ];

    var samples = [];
    let i = 1;
    dataEq.forEach(element => {
        var x = createImg(`sample${i}`, element[0]);
        samples.push([x[0], element[1]]);
        i++;
    });

    const samplesDiv = document.getElementById('sampleData');

    samples.forEach(element => {
        var d = document.createElement('div');
        d.className = "sample-img-div";
        var lbl = document.createElement('h5');
        lbl.innerText = labels[element[1]];

        d.appendChild(element[0]);
        d.appendChild(lbl);
        samplesDiv.appendChild(d);
    });
}


function createImg(name, equation) {
    // Given an equation create the image
    var tb = document.createElement('table');
    tb.id = name;
    tb.className = "table-img";

    var binary = [];
    
    for (let row = 0; row < height; row++) {
        var rowBin = [];
        var currentRow = document.createElement('tr');
        currentRow.className = `row${row}`;

        for (let col = 0; col < width; col++) {
            var tbElem = document.createElement('td');
            tbElem.className = `${row},${col}`;

            currentRow.appendChild(tbElem);

            if (eval(equation)) {
                tbElem.style = 'background-color: black;';
                rowBin.push(1);
            } else {
                rowBin.push(0);
            }
        }
        tb.appendChild(currentRow);
        binary.push(rowBin);
    }
    return [tb, binary];
}


function randomQuadratic() {
    let op = '>';
    if (Math.random() < 0.5) {
        op = '<';
    }
    let m = Math.random() + 0.3;
    let b = Math.floor(Math.random() * 10 - 5);
    return `col ${op} ${m}*(row - 10)**2 + ${b}`;
}

function randomLinearAbs() {
    let op = '>';
    if (Math.random() < 0.5) {
        op = '<';
    }
    let m = Math.random() * 3 + 0.5;
    let b = Math.floor(Math.random() * 10 - 5);
    return `col ${op} Math.abs(${m}*(row - 10)) + ${b}`;
}

function randomWavy() {
    let op = '>';
    if (Math.random() < 0.5) {
        op = '<';
    }
    let m = Math.random() * 3 + 0.4;
    let b = Math.floor(Math.random() * 10 - 5);
    return `col ${op} Math.abs(${m}*(row - 10)) + 1.5*Math.sin(row - 10) + ${b}`;
}


function nextQuestion(event) {
    // Record quiz answers and set up the next question

    //Record answers
    if (event == -1) {
        // Timer timed out. User's answer is wrong.
        userAnswers.push(event);
    } else if (["0", "1", "2"].includes(event.target.value)) {
        userAnswers.push(parseInt(event.target.value));
    }

    clearInterval(timerInterval);

    if (currentQuestion == numQuestions) {
        // Quiz complete. Submit data and clear UI.
        for (let i = 0; i < answerBtns.length; i++) {
            answerBtns[i].style = "display: none;";
        }
        timer.innerText = "";
        progress.innerText = "";
        quizContent.innerHTML = "";

        quizMsg.innerText = "Testing with the machine learning model...";
        quizMsg.style = "padding-top: 130px;";
        submitQuiz();
        return;
    } else if (currentQuestion == 0) {
        // Quiz started. Setup UI.
        for (let i = 0; i < answerBtns.length; i++) {
            answerBtns[i].style = "display: inline;";
        }
        quizMsg.innerHTML = "";
        quizMsg.style = "";
    }

    currentQuestion += 1;
    timer.innerText = "3";
    timerInterval = setInterval(decrementTimer, 1000);
    progress.innerText = `${currentQuestion}/${numQuestions}`;

    // Get random equation
    const eq = [randomQuadratic, randomLinearAbs, randomWavy];
    let answer = Math.floor(Math.random() * eq.length);
    let randomEq = eq[answer]();

    // Create and display the random image
    let [img, binary] = createImg('quiz-img-tbl', randomEq);
    quizContent.innerHTML = "";
    quizContent.appendChild(img);

    testImages.push(img);
    testImgBinData.push(binary);
    correctAnswers.push(answer);
}

function decrementTimer() {
    if (timer.innerText == "1") {
        // User timed out.
        nextQuestion(-1);
    } else {
        timer.innerText = parseInt(timer.innerText) - 1;
    }
}


async function submitQuiz() {
    var xhr = new XMLHttpRequest();
    const url = "https://bot-ch-d7ut7u4wgq-uc.a.run.app";
    xhr.open("POST", url);
    xhr.onload = handleResp;
    xhr.setRequestHeader("Content-Type", "application/json");
    var data = JSON.stringify({
        "images": testImgBinData,
        "userAnswers": userAnswers,
        "correctAnswers": correctAnswers
    });
    xhr.send(data);
}


function handleResp(event) {
    try {
        var respData = JSON.parse(event.target.response);
        displayResults(respData);
    } catch (err) {
        console.log(err);
        quizMsg.innerText = "Internal Error";
    }
}


function displayResults(respData) {
    const modelAns = respData["modelAns"];

    // Table Header
    var d = document.createElement("div");
    d.className = "quiz-row";
    var u = document.createElement("div");
    u.className = "quiz-cell";
    u.style = "vertical-align: middle; padding: 0 10px;";
    u.innerHTML = "Your Answer";
    var m = document.createElement("div");
    m.className = "quiz-cell";
    m.style = "vertical-align: middle; padding: 0 10px;";
    m.innerHTML = "Bot Answer";
    d.appendChild(u);
    d.appendChild(document.createElement("div"));
    d.appendChild(m);
    quizContent.appendChild(d);

    // Show answers
    for (let i = 0; i < testImages.length; i++) {
        var d = document.createElement("div");
        d.className = "quiz-row";

        // User's answer
        var u = document.createElement("div");
        u.className = "quiz-cell";
        u.style = "vertical-align: middle; padding: 0 10px;";
        if (correctAnswers[i] == userAnswers[i]) {
            u.innerHTML = `<img src="correct.png"><br>${labels[userAnswers[i]]}`;
        } else {
            u.innerHTML = `<img src="incorrect.png"><br>${labels[userAnswers[i]]}`;
        }
        
        // Bot's answer
        var m = document.createElement("div");
        m.className = "quiz-cell";
        m.style = "vertical-align: middle; padding: 0 10px;";
        if (correctAnswers[i] == modelAns[i]) {
            m.innerHTML = `<img src="correct.png"><br>${labels[modelAns[i]]}`;
        } else {
            m.innerHTML = `<img src="incorrect.png"><br>${labels[modelAns[i]]}`;
        }
        
        d.appendChild(u);
        d.appendChild(testImages[i]);
        d.appendChild(m);

        quizContent.appendChild(d);
    }

    quizMsg.innerText = respData["msg"];
    quizMsg.style = "";
    tryAgainBtn.style = "display: inline;";
}

function restartQuiz(event) {
    testImages = [];
    userAnswers = [];
    correctAnswers = [];
    currentQuestion = 0;
    nextQuestion(event);
}