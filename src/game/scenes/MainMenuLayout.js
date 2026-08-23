
import * as Phaser from 'phaser';

// You can write more code here

/* START OF COMPILED CODE */

class MainMenuLayout extends Phaser.Scene {

	constructor() {
		super("MainMenuLayout");

		/* START-USER-CTR-CODE */
		// Write your code here.
		/* END-USER-CTR-CODE */
	}

	/** @returns {void} */
	editorCreate() {

		// menu_background
		const menu_background = this.add.image(635, 360, "menu_background");
		menu_background.scaleX = 0.8567675815939715;
		menu_background.scaleY = 0.8607886923031886;

		// hopper_menu
		const hopper_menu = this.add.image(128, 514, "hopper_menu");
		hopper_menu.scaleX = 0.32367022000844076;
		hopper_menu.scaleY = 0.3344717508884089;

		// apulab_logo
		const apulab_logo = this.add.image(668, 127, "apulab_logo");
		apulab_logo.scaleX = 0.3315021662386533;
		apulab_logo.scaleY = 0.3209696430208045;
		apulab_logo.setOrigin(0.5635063677026548, 0.4810183274524026);

		this.events.emit("scene-awake");
	}

	/* START-USER-CODE */

	// Write your code here

	create() {

		this.editorCreate();
	}

	/* END-USER-CODE */
}

/* END OF COMPILED CODE */

// You can write more code here
