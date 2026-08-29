
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
		const menu_background = this.add.image(910, 355, "menu_background");
		menu_background.scaleX = 1.2353018166619714;
		menu_background.scaleY = 1.2585167201281886;

		// hopper_menu
		const hopper_menu = this.add.image(128, 514, "hopper_menu");
		hopper_menu.scaleX = 0.32367022000844076;
		hopper_menu.scaleY = 0.3344717508884089;
		hopper_menu.visible = false;

		// apulab_logo
		const apulab_logo = this.add.image(852, 141, "apulab_logo");
		apulab_logo.scaleX = 0.38367471059620356;
		apulab_logo.scaleY = 0.34243357245560135;
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
