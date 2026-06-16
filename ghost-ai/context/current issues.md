Review the editor canvas implementation and fix the visual issues. It is still not looking exactly as a real design canvas. Check '/context/screenshots/image1.png' for reference.

Read the current canvas component code in 'components/editor'

Issues to look for and document:

1. Shapes not visible:
    - Shapes are able to be dragged and dropped but cannot be seen after they have been dropped. Investigate the isuue.

    - Confirm that draggable nodes in the node panel have the correct draggable attribute and.

    - Check everything is wired correctly

2. Label text coming but cannot do anything about it:
    - once the shapes are dropped there is label text coming but it cannot be used. Look into it and see what the problem is.


After documenting all the issues (the ones mentioned above and any that you find) fix all of the issues so that the above mentioned things work as they are supposed to and the canvas looks and feels like an infinite design canvas (similar to Figma and Excalidraw).