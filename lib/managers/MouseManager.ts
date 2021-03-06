import Vector3D						= require("awayjs-core/lib/geom/Vector3D");

import DisplayObject				= require("awayjs-display/lib/base/DisplayObject");
import TouchPoint					= require("awayjs-display/lib/base/TouchPoint");
import View							= require("awayjs-display/lib/containers/View");
import PickingCollisionVO			= require("awayjs-display/lib/pick/PickingCollisionVO");
import AwayMouseEvent				= require("awayjs-display/lib/events/MouseEvent");
import FrameScriptManager			= require("awayjs-display/lib/managers/FrameScriptManager");

/**
 * MouseManager enforces a singleton pattern and is not intended to be instanced.
 * it provides a manager class for detecting mouse hits on scene objects and sending out mouse events.
 */
class MouseManager
{
	private static _instance:MouseManager;

	private _viewLookup:Array<View> = new Array<View>();

	public _iActiveDiv:HTMLDivElement;
	public _iUpdateDirty:boolean;
	public _iCollidingObject:PickingCollisionVO;
	
	private _nullVector:Vector3D = new Vector3D();
	private _previousCollidingObject:PickingCollisionVO;
	private _queuedEvents:Array<AwayMouseEvent> = new Array<AwayMouseEvent>();

	private _mouseMoveEvent:MouseEvent;

	private _mouseUp:AwayMouseEvent = new AwayMouseEvent(AwayMouseEvent.MOUSE_UP);
	private _mouseClick:AwayMouseEvent = new AwayMouseEvent(AwayMouseEvent.CLICK);
	private _mouseOut:AwayMouseEvent = new AwayMouseEvent(AwayMouseEvent.MOUSE_OUT);
	private _mouseDown:AwayMouseEvent = new AwayMouseEvent(AwayMouseEvent.MOUSE_DOWN);
	private _mouseMove:AwayMouseEvent = new AwayMouseEvent(AwayMouseEvent.MOUSE_MOVE);
	private _mouseOver:AwayMouseEvent = new AwayMouseEvent(AwayMouseEvent.MOUSE_OVER);
	private _mouseWheel:AwayMouseEvent = new AwayMouseEvent(AwayMouseEvent.MOUSE_WHEEL);
	private _mouseDoubleClick:AwayMouseEvent = new AwayMouseEvent(AwayMouseEvent.DOUBLE_CLICK);

	private onClickDelegate:(event:MouseEvent) => void;
	private onDoubleClickDelegate:(event:MouseEvent) => void;
	private onMouseDownDelegate:(event:MouseEvent) => void;
	private onMouseMoveDelegate:(event:MouseEvent) => void;
	private onMouseUpDelegate:(event:MouseEvent) => void;
	private onMouseWheelDelegate:(event:MouseEvent) => void;
	private onMouseOverDelegate:(event:MouseEvent) => void;
	private onMouseOutDelegate:(event:MouseEvent) => void;

	/**
	 * Creates a new <code>MouseManager</code> object.
	 */
	constructor()
	{
		this.onClickDelegate = (event:MouseEvent) => this.onClick(event);
		this.onDoubleClickDelegate = (event:MouseEvent) => this.onDoubleClick(event);
		this.onMouseDownDelegate = (event:MouseEvent) => this.onMouseDown(event);
		this.onMouseMoveDelegate = (event:MouseEvent) => this.onMouseMove(event);
		this.onMouseUpDelegate = (event:MouseEvent) => this.onMouseUp(event);
		this.onMouseWheelDelegate = (event:MouseEvent) => this.onMouseWheel(event);
		this.onMouseOverDelegate = (event:MouseEvent) => this.onMouseOver(event);
		this.onMouseOutDelegate = (event:MouseEvent) => this.onMouseOut(event);
	}

	public static getInstance():MouseManager
	{
		if (this._instance)
			return this._instance;

		return (this._instance = new MouseManager());
	}

	public fireMouseEvents(forceMouseMove:boolean)
	{
		 // If colliding object has changed, queue over/out events.
		if (this._iCollidingObject != this._previousCollidingObject) {
			if (this._previousCollidingObject)
				this.queueDispatch(this._mouseOut, this._mouseMoveEvent, this._previousCollidingObject);

			if (this._iCollidingObject)
				this.queueDispatch(this._mouseOver, this._mouseMoveEvent);
		}

		 // Fire mouse move events here if forceMouseMove is on.
		 if (forceMouseMove && this._iCollidingObject)
			this.queueDispatch( this._mouseMove, this._mouseMoveEvent);

		var event:AwayMouseEvent;
		var dispatcher:DisplayObject;

		// Dispatch all queued events.
		var len:number = this._queuedEvents.length;
		for (var i:number = 0; i < len; ++i) {
			event = this._queuedEvents[i];
			dispatcher = event.object;

			// bubble event up the heirarchy until the top level parent is reached
			while (dispatcher) {
				if (dispatcher._iIsMouseEnabled())
					dispatcher.dispatchEvent(event);

				dispatcher = dispatcher.parent;
			}
			// not totally sure, but i think just calling it is easier and cheaper than any options for that
			// if nothing is queued, the function will return directly anyway
			FrameScriptManager.execute_queue();

		}


		this._queuedEvents.length = 0;

		this._previousCollidingObject = this._iCollidingObject;

		this._iUpdateDirty = false;
	}

//		public addViewLayer(view:View)
//		{
//			var stg:Stage = view.stage;
//
//			// Add instance to mouse3dmanager to fire mouse events for multiple views
//			if (!view.stageGL.mouse3DManager)
//				view.stageGL.mouse3DManager = this;
//
//			if (!hasKey(view))
//				_view3Ds[view] = 0;
//
//			_childDepth = 0;
//			traverseDisplayObjects(stg);
//			_viewCount = _childDepth;
//		}

	public registerView(view:View)
	{
		view.htmlElement.addEventListener("click", this.onClickDelegate);
		view.htmlElement.addEventListener("dblclick", this.onDoubleClickDelegate);
		view.htmlElement.addEventListener("touchstart", this.onMouseDownDelegate);
		view.htmlElement.addEventListener("mousedown", this.onMouseDownDelegate);
		view.htmlElement.addEventListener("touchmove", this.onMouseMoveDelegate);
		view.htmlElement.addEventListener("mousemove", this.onMouseMoveDelegate);
		view.htmlElement.addEventListener("mouseup", this.onMouseUpDelegate);
		view.htmlElement.addEventListener("touchend", this.onMouseUpDelegate);
		view.htmlElement.addEventListener("mousewheel", this.onMouseWheelDelegate);
		view.htmlElement.addEventListener("mouseover", this.onMouseOverDelegate);
		view.htmlElement.addEventListener("mouseout", this.onMouseOutDelegate);

		this._viewLookup.push(view);
	}

	public unregisterView(view:View)
	{
		view.htmlElement.removeEventListener("click", this.onClickDelegate);
		view.htmlElement.removeEventListener("dblclick", this.onDoubleClickDelegate);
		view.htmlElement.removeEventListener("touchstart", this.onMouseDownDelegate);
		view.htmlElement.removeEventListener("mousedown", this.onMouseDownDelegate);
		view.htmlElement.removeEventListener("touchmove", this.onMouseMoveDelegate);
		view.htmlElement.removeEventListener("mousemove", this.onMouseMoveDelegate);
		view.htmlElement.removeEventListener("touchend", this.onMouseUpDelegate);
		view.htmlElement.removeEventListener("mouseup", this.onMouseUpDelegate);
		view.htmlElement.removeEventListener("mousewheel", this.onMouseWheelDelegate);
		view.htmlElement.removeEventListener("mouseover", this.onMouseOverDelegate);
		view.htmlElement.removeEventListener("mouseout", this.onMouseOutDelegate);

		this._viewLookup.slice(this._viewLookup.indexOf(view), 1);
	}

	// ---------------------------------------------------------------------
	// Private.
	// ---------------------------------------------------------------------

	private queueDispatch(event:AwayMouseEvent, sourceEvent, collider:PickingCollisionVO = null)
	{
		// 2D properties.
		if (sourceEvent) {
			event.ctrlKey = sourceEvent.ctrlKey;
			event.altKey = sourceEvent.altKey;
			event.shiftKey = sourceEvent.shiftKey;
			event.screenX = (sourceEvent.clientX != null)? sourceEvent.clientX : sourceEvent.changedTouches[0].clientX;
			event.screenY = (sourceEvent.clientY != null)? sourceEvent.clientY : sourceEvent.changedTouches[0].clientY;
		}

		if (collider == null)
			collider = this._iCollidingObject;

		// 3D properties.
		if (collider) {
			// Object.
			event.object = collider.displayObject;
			event.renderableOwner = collider.renderableOwner;
			// UV.
			event.uv = collider.uv;
			// Position.
			event.localPosition = collider.localPosition? collider.localPosition.clone() : null;
			// Normal.
			event.localNormal = collider.localNormal? collider.localNormal.clone() : null;
			// Face index.
			event.index = collider.index;
		} else {
			// Set all to null.
			event.uv = null;
			event.object = null;
			event.localPosition = this._nullVector;
			event.localNormal = this._nullVector;
			event.index = 0;
			event.subGeometryIndex = 0;
		}

		// Store event to be dispatched later.
		this._queuedEvents.push(event);
	}

	// ---------------------------------------------------------------------
	// Listeners.
	// ---------------------------------------------------------------------

	private onMouseMove(event:MouseEvent)
	{
		event.preventDefault();

		this.updateColliders(event);

		if (this._iCollidingObject)
			this.queueDispatch(this._mouseMove, this._mouseMoveEvent = event);
	}

	private onMouseOut(event:MouseEvent)
	{
		this._iActiveDiv = null;

		this.updateColliders(event);

		if (this._iCollidingObject)
			this.queueDispatch(this._mouseOut, event);
	}

	private onMouseOver(event:MouseEvent)
	{
		this._iActiveDiv = <HTMLDivElement> event.target;

		this.updateColliders(event);

		if (this._iCollidingObject)
			this.queueDispatch( this._mouseOver, event);
	}

	private onClick(event:MouseEvent)
	{
		this.updateColliders(event);

		if (this._iCollidingObject)
			this.queueDispatch(this._mouseClick, event);
	}

	private onDoubleClick(event:MouseEvent)
	{
		this.updateColliders(event);

		if (this._iCollidingObject)
			this.queueDispatch(this._mouseDoubleClick, event);
	}

	private onMouseDown(event)
	{
		event.preventDefault();

		this._iActiveDiv = <HTMLDivElement> event.target;

		this.updateColliders(event);

		if (this._iCollidingObject)
			this.queueDispatch(this._mouseDown, event);
	}

	private onMouseUp(event)
	{
		event.preventDefault();

		this.updateColliders(event);

		if (this._iCollidingObject)
			this.queueDispatch(this._mouseUp , event);
	}

	private onMouseWheel(event:MouseEvent)
	{
		this.updateColliders(event);

		if (this._iCollidingObject)
			this.queueDispatch(this._mouseWheel, event);
	}


	private updateColliders(event)
	{
		var view:View;
		var bounds:ClientRect;
		var mouseX:number = (event.clientX != null)? event.clientX : event.changedTouches[0].clientX;
		var mouseY:number = (event.clientY != null)? event.clientY : event.changedTouches[0].clientY;
		var len:number = this._viewLookup.length;
		for (var i:number = 0; i < len; i++) {
			view = this._viewLookup[i];
			view._pTouchPoints.length = 0;
			bounds = view.htmlElement.getBoundingClientRect();

			if (event.touches) {
				var touch;
				var len:number = event.touches.length;
				for (var i:number = 0; i < len; i++) {
					touch = event.touches[i];
					view._pTouchPoints.push(new TouchPoint(touch.clientX + bounds.left, touch.clientY + bounds.top, touch.identifier));
				}
			}

			if (this._iUpdateDirty)
				continue;

			if (mouseX < bounds.left || mouseX > bounds.right || mouseY < bounds.top || mouseY > bounds.bottom) {
				view._pMouseX = null;
				view._pMouseY = null;
			} else {
				view._pMouseX = mouseX + bounds.left;
				view._pMouseY = mouseY + bounds.top;

				view.updateCollider();

				if (view.layeredView && this._iCollidingObject)
					break;
			}
		}

		this._iUpdateDirty = true;
	}
}

export = MouseManager;