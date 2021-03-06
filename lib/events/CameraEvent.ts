import Event					= require("awayjs-core/lib/events/Event");

import Camera					= require("awayjs-display/lib/entities/Camera");

/**
 * @class away.events.CameraEvent
 */
class CameraEvent extends Event
{
	public static PROJECTION_CHANGED:string = "projectionChanged";

	private _camera:Camera;

	constructor(type:string, camera:Camera)
	{
		super(type);

		this._camera = camera;
	}

	public get camera():Camera
	{
		return this._camera;
	}
}

export = CameraEvent;