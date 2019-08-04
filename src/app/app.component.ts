import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Game, AUTO, Sprite, Graphics, Tween, Group, Image, Button, Sound, GameObjectCreator, CANVAS, Text } from 'phaser-ce';
import { PathLocationStrategy } from '@angular/common';
import { TestBed } from '@angular/core/testing';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('gameDiv', { static: true }) gameDiv: ElementRef;

  constructor() {

  }
  ngOnInit() {
    game = new Game(this.gameDiv.nativeElement.offsetWidth, this.gameDiv.nativeElement.offsetHeight, AUTO, 'gameDiv', { preload: preload, create: create, update: update });
  }
  title = 'Devin Griffin';
}
function preload() {
  game.load.image("circle", "assets/game/circle.png");
}
var game: Game;
var circle: Sprite;
var texts = [];
var textIndex = 0;
var sentences = [
  "B.S. in Computer Science. GPA: 3.61/4.0",
  "Don Lang Scholar – full ride scholarship",
  "Hagan Scholar – I manage a $15,000 Schwab investment account",
  "Game Developer at Clear for Ears (Jun 2018 - Present)",
  "Redesigned the entire suite of games to unify the graphic style and make them fun.",
  "Used Phaser to create two new auditory rehabilitation games.",
  "Used Angular and Firebase to redesign our website (previously AWS + PHP).",
  "Interned Summer ’18 and stayed on since",
  "Web Developer at Washington University G.I.S. (Oct 2017 - May 2018)",
  "Used Ruby on Rails, GeoBlacklight, PostgreSQL, and the Boundless Suite to create a geospatial discovery web app to house WashU’s spatial data",
  "Project Manager at DevSTAC (Sept 2017 - May 2018)",
  "Lead a team that used formidable forms and the Service Now API to digitize incident report forms for Barnes Jewish Hospital",
  "Teacher's Assistant at Washington University (Jan 2018 - Present)",
  "Web Development for 3 semesters (Spring ‘18, Fall ‘18, Spring ‘19).",
  "Introduction to Computer Security (Fall ’19)",
  "       Projects        ",
  "Elemental Fighter - Multiplayer 2D pixel art game that features lag free networking",
  "Gamified Math Learning Platform - Online math learning platform that lets students compete against each other in math games.",
  "Sello (Letgo for Universities) - iOS buying and selling platform for college students",
  "Family Fun Center App - App that keeps track of schedule and hours worked by employees of a family fun center.",
  "        Awards        ",
  "3rd in Programming and Coding at Missouri FBLA State Convention",
  "4th in Computer Programming at Missouri State Pummel Relays",
  "9th in Computer Problem Solving at Missouri FBLA State Convention",
  "Won Y’s Thoughts Entrepreneurship challenge with a Table Tennis Matchmaking app.",
  "Proficient: Java, JavaScript, TypeScript, Phaser",
  "Basic: Python, C++, C#, Arduino C, PHP, Swift, React, Angular, Unity, Firebase, AWS, jQuery, MySQL",
  "Classes (1/2) Data Structures and Algorithms, Computer Science II (Arduino Class), Web Development, Object-Oriented Software Development Laboratory (C++)",
  "Classes (2/2) Rapid Prototype Development and Creative Programming (Full Stack Web Dev), Mobile Application Development (iOS Dev in Swift), Introduction to Computer Security, Video Game Programming (Unity)",
]
var sentenceIndex = 0;
var mainText: Text;
var scoreText: Text;
var score = 0;
function create() {
  circle = game.add.sprite(game.height * .10, game.height * .10, "circle");
  circle.height = game.height * .20;
  circle.width = game.height * .20;
  circle.anchor.set(0.5);
  game.physics.startSystem(Phaser.Physics.ARCADE);
  game.physics.arcade.gravity.y = game.height * .5;

  game.stage.backgroundColor = "#F6F5ED";
  mainText = game.add.text(game.world.centerX, game.world.centerY, "Click to start the game!");
  mainText.anchor.set(0.5);
  mainText.fontSize = 0.5 * fontSizer(mainText, game);


  var text1 = game.add.text(game.width, 0, "Click to jump, when you collide with any text, you lose!");
  var text2 = game.add.text(game.width * 1.75, 0, "My name is Devin Griffin and I study Computer Science at Washington University");
  text1.fontSize = 0.75 * fontSizer(text1, game);
  text2.fontSize = 0.75 * fontSizer(text2, game);

  texts.push(text1);
  texts.push(text2);

  game.physics.enable([circle, text1, text2], Phaser.Physics.ARCADE);
  circle.body.collideWorldBounds = true;
  for (var i = 0; i < texts.length; i++) {
    texts[i].body.allowGravity = false;
  }
  scoreText = game.add.text(game.width * .10, 0, "Score: 0");
  scoreText.fontSize = 0.35 * fontSizer(scoreText, game);
  scoreText.y += scoreText.height;




}

var pointerReleased = true;
var gameStarted = false;
var frames = 0;
var topScore = 0;
function update() {
  if (game.input.activePointer.isDown && !gameStarted && canStart) {
    startGame();
  }
  if (gameStarted) {
    circle.angle += 8;
    if (++frames % 120 == 0) {
      score++;
      scoreText.text = `Score: ${score}`;
    }
  }

  if (!game.input.activePointer.isDown) {
    pointerReleased = true;
  }
  if (game.physics.arcade.collide(circle, [texts[0], texts[1]])) {
    stopGame();

  }
  if (game.input.activePointer.isDown && pointerReleased) {
    circle.body.velocity.y -= game.height * 0.5;
    pointerReleased = false;
  }
  for (var i = 0; i < texts.length; i++) {
    if (texts[i].x + texts[i].width < 0) {
      if (i == 0) {
        texts[i].x = texts[1].x + game.width * 1;
      } else {
        texts[i].x = texts[0].x + game.width * 1;
      }
      if (sentenceIndex >= sentences.length) {
        sentenceIndex = 0;
      }
      texts[i].text = String(sentences[sentenceIndex++]);
      texts[i].fontSize = 0.75 * fontSizer(texts[i], game);
      texts[i].y = game.height * 0.1 + game.height * 0.8 * Math.random();
    }
  }
}
function fontSizer(text, frame) {
  var fontSize = 80;
  text.fontSize = fontSize;
  while (text.width > frame.width) {
    fontSize -= 1;
    text.fontSize = fontSize;
  }
  text.fontSize = fontSize * 0.98;
  return fontSize * 0.98;
}
var canStart = true;
function stopGame() {
  canStart = false;
  setTimeout(function () { canStart = true }, 2000);
  gameStarted = false;
  for (var i = 0; i < texts.length; i++) {
    texts[i].body.velocity.x = 0;
  }
  topScore = Math.max(topScore, score);
  mainText.text = `You earned a score of ${score}\nYour top score is ${topScore}\nClick to play again.`;
  mainText.visible = true;
  texts[0].x = game.width;
  texts[1].x = game.width * 2;
  score = 0;
}
function startGame() {
  scoreText.text = `Score: ${score}`;
  mainText.visible = false;
  gameStarted = true;
  for (var i = 0; i < texts.length; i++) {
    texts[i].body.velocity.x = -game.width * .2;
    texts[i].body.velocity.y = 0;
  }
}