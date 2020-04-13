PLANS
- restructure input?
  - keep input info in one place, maybe set up a reducer to perform specific actions depending on focus / other variables.
  - have something on state that marks when modifier keys are held down (same with mouse clicks?)


        if (source) {
        state.layerData[source].ctx.save()
        if (state.selectionPath) {
          state.layerData[source].ctx.clip(state.selectionPath)
        }
        newLayerData.ctx.drawImage(state.layerData[source].ctx.canvas, 0, 0)
        state.layerData[source].ctx.restore()
      }



NOTES ON DRAWSPACE REWORK:
- it's coming along so far, but it's def not there yet.
- need to keep track of mousedown + mouseup and tie that into whether a history state gets created
- need to not start a new action for... well, for most things, actually. Pretty much anything that uses staging.
- pencil-like actions need to be stored as an array instead of committed at the end of each mouseout
- NAH. maybe. hmm.
- shape actions need to keep their origin, and have the input be adjusted so it seems like the mouse is at the edge of bounds when it's out.
- brush actions that go directly on active are... probably fine? except for the history state thing.
- still need to get hand out of there! and find a way to use certain actions off of the canvas. maybe take this out to workspace?
- also, there's the small issue of a gap appearing on mouseover. could possibly fix this by updating origin on ALL mousemove actions where mouse is out of bounds? seems a bit extreme though.

- AAAARGH
- Okay, I think setting the mousemove to a global envent will work better

- DOUBLE ARRRRRGH
- Okay okay, maybe putting mouse move onto the highest level will do?!?!?!

- ... this... needs some thought. Need to see how others have done it.


- Ok. Plan. Might be time to merge DrawSpace and Workspace. There is no more benefit to keeping Drawspace separate at this point. NEED to find a way to break this down though if that is the case.

- Basically, the old plan is the new plan. Or one of the old plans, probably. drawing actions will be tracked across the entirety of the workspace. (mouseleave from workspace WILL be tracked. we don't have to be Photoshop exactly.)

- Draw onto canvases as appropriate, don't start a draw action until the canvas is actually moved onto. End a draw action only on mouseup or mouseleave. Brushes and pens should work fine off of this. Shapes... probably are fine too. Need to think if I want people to be able to start a shape off the canvas and grow it into view.

- Selection will need different handling, probably. Need to pretend the mouse is at the edge when it's out of bounds. Can probably use this on other tools as well to highlight the edge the line will come into.

- Tricky part here is def going to be handling the translation between workspace and canvas. I THINK those mechanics are at least partially in place though.

- This is gonna be stupid. LET'S TRY IT.

- But first... serious when I said I wanted to break it down some more. I think classes deserve another look. If I can get something working in DrawSpace, pretty sure it'll work elsewhere.

- Let's look at state. Which of these items CANNOT be inside a class "Action"?
  - isDrawing should be outside. Can probably be on React state, though not sure it needs to be.
    - ACTUALLY, if we put that on Redux state, pretty sure we could use it to halt menu actions from taking place during draw actions. Maybe a good idea?
  - origin is fine, dest is fine (could still combine those)
  -might have to look into hold (and if it's still necessary). Same with interrupt. Would rather not use interrupt anyway.
  - throttle is fine, lockedAxis is fine, heldShift is fine.
  - tool is probably unneccesary. (see earlier note about menu actions, would solve this problem anyway)

- what will need to be passed into these classes (at instantiation)?
  - dispatch (easier that way)
  - tool (which will link to objects which will contain onSuchAndSuch behaviors, flags, etc) <== NOPE. Can do subclasses if I keep it smart.
  - pointer to layerData
  - activeLayer

- what will need to be passed in with EACH mouse event?
  - event data
  - translation data

- how do the behaviors break down?
  - pencil - "pencil-like"
  - brush - "brush-like"
  - eraser - "brush-like"
  - line - "shape"
  - fillRect - "shape"
  - drawRect - "shape"
  - fillEllipse - "shape"
  - drawEllipse - "shape"
  - selectRect - "shape" + "selection"
  - selectEllipse - "shape" + "selection"
  - lasso - "pencil-like" + "selection"
  - eyeDropper - "eye-dropper"
  - move - "move"
  - hand - "hand"
  - zoom - "zoom"
  - bucketFill - "fill"

Pencil-like:
  - draws to staging first
  - final draw is to active 
  - uses lockedAxis while shiftKey is held
  - uses full destArray each update
  - Differences Between Members:
    - largely differences due to the lasso tool being a selection tool

Brush-like:
  - draws to active directly
  - uses prevImageData to create history state
  - uses lockedAxis while shiftKey is held
  - builds it's own destArray from previous point
  - also uses lastMid to build it's destArray
  - could probably get away with not using full destArray, and just saving previous point and previous mid.
  - builds a gradient - this could probably be done once to save time
  - only fires when movement has gone past "density" parameter (currently locked at 1/8 brush size)
  - Differences Between Members:
    - eraser has a different gradient (colors fixed) and it uses a composite flag. Beyond that, no real differences. 

Shape:
  - draws to staging first
  - final draw is to active
  - Only uses 1 destination point, and updates it each move
  - Most use shiftKey to determine if convertDestToRegularShape is used
  - Differences Between Members:
    - The selection tools are obviously very different, but beyond that, differences are mostly the type of shape, and whether it is filled in.
    - Except for the line tool. It doesn't currently have shift behavior

Selection:
  - draws to staging first
  - final draw is to selection
  - also updates selection path
  - upon mousedown, clears selection dependent on shiftKey
  - ignores clipping (obv)
  - will need special behavior while draw action is occuring and cursor is off the canvas
  - at end, checks to see if shift was held AT START of action (not at end)
  - closes path automatically, even if normal draw behavior would not
  - Differences Between Members:
    - This one is weird. Selection is not really a category unto itself, more like a collection of additional behaviors tacked on to things from other categories.


Eye-dropper:
  - doesn't alter any canvases
  - interacts directly with all regular canvases
  - is the only action to perform it's primary function upon mousedown (will need to handle that if action is started outside canvas? maybe not, actually)
  - uses meta / ctrl key
  - does not create a history state

Move:
  - draws to active directly
  - uses prevImageData to create history state
  - uses throttle
  - will likely need to be completely changed soon to incorporate transforms, and to ensure it doesn't disappear off-canvas before changes are applied.

Hand:
  - doesn't alter any canvases
  - doesn't interact with any canvasData
  - should be usable outside of canvas (flouting isDrawing rules)
  - maybe should be an edge case, and should not use a class?
  - does not create a history state

Zoom:
  - doesn't alter any canvases
  - doesn't interact with any canvasData
  - should be usable outside of canvas (flouting isDrawing rules)
  - maybe should be an edge case, and should not use a class?
  - uses alt key
  - does not create a history state

Fill:
  - does absolutely nothing until mouseup
  - should not function unless mouseup occurs inside canvas


So, what I'm hearing is we need functions for:
- start action
- move action
- end action

properties can include:
- usesStaging <== probably not necessary!
- target
- composite
- usesPrevImageData <== probably not necessary!
- gradient
- isSelectionTool
(bit of extra about that one: selection tools right now are all pencil-like or shape (with a fill on the way). selection behaviors should probably be integrated into their onStart, onMove, etc functions. Unless I come up with a better idea.)

NOTES ON TRANSFORM LAYER

Steps to do a transform action:
- make selection (done)
- trigger transform
- check to make sure something is inside path on active layer
- cut selection from active layer
- transform layer is created
  - position: smallest x and smallest y in selection
  - size: largest x - smallest x, largest y - smallest y
  - content: paste selection from active layer
- every action other than applying the transformation and moving / transforming the transform layer is disabled
- transform controls = horizontal size, vertical size, rotation, horizontal skew, vertical skew
- hold shift to lock aspect ratio on resize, and to lock rotation to nearest eighth. hold ctrl or alt to skew?
- maybe create a movable anchor point if you really want a headache (would only affect rotation)
- render controls on top of transform layer. somehow. also, enable them.
  - probably want to make the transform layer it's own component. maybe it contains a "regular" layer?
- once transform is applied, cut from transform layer, paste to active. Then disable transform layer, reenable other actions.

When importing an image, create new layer, paste image into a transform layer, then when tranform is applied, paste that to the created new layer.  