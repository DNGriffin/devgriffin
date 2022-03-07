import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PathLocationStrategy } from '@angular/common';
import { TestBed } from '@angular/core/testing';

import Phaser from 'phaser';

var gameScope;
var angScope;
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends Phaser.Scene implements OnInit {
  @ViewChild('gameDiv', { static: true }) gameDiv: ElementRef;
  config;
  game;
  gameHeight = window.innerHeight * 0.7;
  constructor() {
    super("main");
    if (!angScope) {
      angScope = this;
    }
    if (angScope) {
      gameScope = this;
    }

    this.config = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight * 0.7,
      parent: 'gameDiv',
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
          // gravity: { y: 100 }
        }
      },
      scene: [AppComponent]
    };
  }

  ngOnInit() {
    this.game = new Phaser.Game(this.config);
  }
  title = 'Devin Griffin';
  preload() {
    if(innerWidth<800){
      this.isPhone = true;
    }
    this.cameras.main.setBackgroundColor("#F6F5ED");
    if(this.isPhone){
      this.load.image("umbrella", "assets/game/umbrellasmall.png");
      this.load.image("droplet", "assets/game/dropletsmall.png");
    }else{
      this.load.image("umbrella", "assets/game/umbrella.png");
      this.load.image("droplet", "assets/game/droplet.png");
    }
  }
  isPhone = false;
  gameText;
  umbrella: Phaser.GameObjects.Sprite;
  umbrellaScale;
  umbrellaTween: Phaser.Tweens.Tween;
  score = 0;
  highScore = 0;
  completed = false;
  incrementScore() {
    angScope.score++;
    angScope.highScore = Math.max(angScope.highScore, angScope.score);
  }
  resetScore() {
    angScope.score = 0;
  }
  droplets = [];
  dropletIndex = 0;
  spawnDroplet() {
    if (this.gamePaused) {
      return;
    }
    var isUpsideDown = false
    if (this.spawnUpsideDown && Math.random() < 0.5) {
      isUpsideDown = true;
    }
    var droplet: Phaser.Physics.Arcade.Sprite;
    if (isUpsideDown) {
      droplet = this.physics.add.sprite(Phaser.Math.Between(innerWidth * 0.1, innerWidth * 0.9), this.gameHeight * 1.2, "droplet").setVelocityY(-this.gameHeight / 5);
      droplet.flipY = true;
    } else {
      droplet = this.physics.add.sprite(Phaser.Math.Between(innerWidth * 0.1, innerWidth * 0.9), -this.gameHeight / 5, "droplet").setVelocityY(this.gameHeight / 5);

    }
    droplet.name = "alive";
    droplet.displayWidth = Phaser.Math.Between(innerWidth * 0.03, innerWidth * 0.06);
    droplet.scaleY = droplet.scaleX;
    setTimeout(() => {
      if (droplet.name == "alive") { this.spawnDroplet() };
      droplet.destroy();
    }, 6000);
    this.physics.add.overlap(droplet, this.umbrella, this.umbrellaCollide, null, this);
    this.physics.add.overlap(droplet, this.sentenceSprites, this.textCollide, null, this);
    this.droplets[(this.dropletIndex++) % 5] = droplet;
  }
  getFurtherestRightSentence() {
    var maxX = this.sentenceSprites[0].x;
    var furtherestSentence = this.sentenceSprites[0];
    console.log(maxX);
    this.sentenceSprites.forEach(sentence => {
      if (sentence.x > maxX) {
        maxX = sentence.x;
        furtherestSentence = sentence;
      }
    });
    return furtherestSentence;
  }
  umbrellaCollide(droplet, umbrella) {
    droplet.destroy();
    droplet.name = "dead";
    this.incrementScore();
    this.spawnDroplet();
  }
  gamePaused = true;
  endGame() {
    this.canResumeGame = false;
    setTimeout(()=>{this.canResumeGame = true;},1000);
    this.resetScore();

    this.gameText.setVisible(true);
    this.gameText.setText("You let the text get rained on, score reset.\nClick to resume the game\nOr, scroll down to read my resume.")
    this.umbrellaTween.remove();
    this.umbrella.scaleX = this.umbrellaScale;
    this.umbrella.scaleY = this.umbrellaScale;

    this.gamePaused = true;
    this.sentenceSprites.forEach(sentence => {
      sentence.body.velocity.x = 0
    });
    this.droplets.forEach(droplet => {
      droplet.name = "dead";
      droplet.destroy();
    });
  }
  textCollide(droplet, text) {
    droplet.destroy();
    this.endGame();
  }
  resumeGame() {
    if (!this.gamePaused || !this.canResumeGame) {
      return;
    }
    this.umbrellaTween = this.tweens.add({
      targets: this.umbrella,
      scale: { from: this.umbrellaScale, to: this.umbrellaScale * 0.4 },
      ease: 'linear',
      duration: 15000,
    });

    setTimeout(() => { this.spawnUpsideDown = true }, 10000);
    this.gameText.setVisible(false);
    this.gamePaused = false;
    this.sentenceSprites.forEach(sentence => {
      sentence.body.velocity.x = -innerWidth / 4;
    });
    this.spawnDroplet();
    setTimeout(() => { this.spawnDroplet(); }, 500);
    setTimeout(() => { this.spawnDroplet(); }, 100);
    setTimeout(() => { this.spawnDroplet(); }, 1500);
    setTimeout(() => { this.spawnDroplet(); }, 2000);
  }
  spawnUpsideDown = false;
  create() {
    this.createText();
    this.umbrella = this.physics.add.sprite(innerWidth / 2, this.gameHeight * 0.75, "umbrella")
    this.umbrella.setInteractive();
    if(this.isPhone){
      this.umbrella.displayWidth = innerWidth / 5;
    }else{
      this.umbrella.displayWidth = innerWidth / 10;
    }
    this.umbrella.scaleY = this.umbrella.scaleX;
    this.umbrellaScale = this.umbrella.scaleY;
    this.input.on('pointerdown', (pointer, gameObject, dragX, dragY) => {
      console.log("pointer down");
      this.resumeGame();
    });
    this.spawnDroplet();
  }
  restartGame() {
    this.sentenceSprites.forEach(sentence => {
      sentence.destroy();
    });
    this.sentenceSprites = [];
    this.scene.stop("main"); this.scene.restart()
  }
  sentenceIndex = 0;
  sentenceSprites = [];
  createText() {
    this.gameText = this.add.text(innerWidth / 2, this.gameHeight *0.25, "Click on the umbrella to start the game.\nDrag the umbrella to keep the text dry.").setOrigin(0.5, 0.5).setFontFamily('Verdana, "Times New Roman", Tahoma, serif').setFill("black");
    var gameTextSize = innerWidth * 0.035;
    if(gameTextSize>40){
      gameTextSize = 40;
    }
    this.gameText.setFontSize(gameTextSize);

    for (var i = 0; i < 3; i++) {
      var sentenceSprite;
      sentenceSprite = this.add.text(innerWidth / 2, this.gameHeight / 2, this.sentences[this.sentenceIndex++]).setOrigin(0, 0.5).setFontSize(innerHeight * 0.06).setFontFamily('Verdana, "Times New Roman", Tahoma, serif').setFill("black");
      this.physics.world.enable(sentenceSprite);
      this.sentenceSprites.push(sentenceSprite);
    }
    this.sentenceSprites[0].x = innerWidth;
    this.sentenceSprites[1].x = this.sentenceSprites[0].x + this.sentenceSprites[0].displayWidth + innerWidth / 6;
    this.sentenceSprites[2].x = this.sentenceSprites[1].x + this.sentenceSprites[1].displayWidth + innerWidth / 6;

  }
  canResumeGame = true;
  update() {
    if (this.umbrella.y > this.gameHeight / 2) {
      this.umbrella.flipY = true;
    } else {
      this.umbrella.flipY = false;
    }

    this.sentenceSprites.forEach(sentence => {
      if (sentence.x + sentence.displayWidth < 0) {
        this.sentenceIndex++;
        this.sentenceIndex %= this.sentences.length;

        sentence.setText(this.sentences[this.sentenceIndex])
        sentence.body.setSize(sentence.displayWidth, sentence.displayHeight);
        sentence.x = this.getFurtherestRightSentence().x + this.getFurtherestRightSentence().displayWidth + innerWidth / 6;
      }
    });

    var pointer = this.input.activePointer;
    if (pointer.isDown) {
        if(pointer.y >= 0 && pointer.y <= this.gameHeight){
          this.umbrella.x = pointer.x;
          this.umbrella.y = pointer.y;
        }
    }
  }
  sentences = [
    "Resume Content (Shortened for game)",
    "Gradutaed from WashU with a B.S. in Computer Science. GPA: 3.7/4.0",
    "Work Experience:",
    "Software Engineer at AT&T (July 2021 - Present)",
    "Software Engineer Intern at AT&T (Jun 2020 - Aug 2020)",
    "Full-stack Web Developer at Amptify (Jun 2018 - June 2021)",
    "Full-stack Web Developer at Washington University G.I.S. (Oct 2017 - May 2018)",
    "Teacher's Assistant at Washington University (Jan 2018 - Jan 2020)",
    "Projects:",
    "Coin Toss (2020) - iOS App and Web App that uses simulation games to make decisions for you.",
    "Published in Apple App Store (CoinTossDecisions)",
    "Multiplayer Math (2019) - High School & College course supplement tool where students respond to instructor questions by playing networked cooperative games.",
    "Elemental Fighter (2019) - Multiplayer 2D pixel art game that features lag free networking and skill-based combat.",
    "Math Battles (2018) - Online math learning platform that lets students compete against each other in math games, to provide an incentive to learn math.",
    "Sello (Letgo for Universities) (2018) - iOS buying and selling platform for college students which allows you to filter by University.",
    "Awards",
    "3rd in Programming and Coding at Missouri FBLA State Convention",
    "4th in Computer Programming at Missouri State Pummel Relays",
    "Won Y’s Thoughts Entrepreneurship challenge with a Table Tennis Matchmaking app.",
    "Technologies:",
    "Proficient: Java, JavaScript, TypeScript, Phaser, Angular, React, Firebase, Python, Jenkins, Jira",
    "Basic: C++, C#, Arduino C, PHP, Swift, Unity, AWS, jQuery, MySQL",
    "Relevant Classes: Data Structures and Algorithms, Computer Science II (Arduino Class)",
    "Web Development, Object-Oriented Software Development Laboratory (C++), Rapid Prototype Development and Creative Programming (Full Stack Web Dev)",
    "Mobile Application Development (iOS Dev in Swift), Introduction to Computer Security, Video Game Programming (Unity), Analysis of Algorithms",
    "Mobile App Development II, Programming Tools and Techniques, Video Game Programming II, Internet of Things, Software Engineering Workshop, Introduction to Systems Software",
  ]
}
