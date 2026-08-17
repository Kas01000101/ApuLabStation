
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
		menu_background.scaleX = 0.766;
		menu_background.scaleY = 0.766;

		// hopper_menu
		const hopper_menu = this.add.image(160, 405, "hopper_menu");
		hopper_menu.scaleX = 0.39;
		hopper_menu.scaleY = 0.39;

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
