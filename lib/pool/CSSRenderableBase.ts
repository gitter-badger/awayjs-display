import Matrix3D						= require("awayjs-core/lib/geom/Matrix3D");

import IMaterialOwner				= require("awayjs-display/lib/base/IMaterialOwner");
import IRenderable					= require("awayjs-display/lib/pool/IRenderable");
import RenderablePool				= require("awayjs-display/lib/pool/RenderablePool");
import IEntity						= require("awayjs-display/lib/entities/IEntity");

/**
 * @class away.pool.RenderableListItem
 */
class CSSRenderableBase implements IRenderable
{
	/**
	 *
	 */
	private _pool:RenderablePool;

	/**
	 *
	 */
	public next:CSSRenderableBase;

	/**
	 *
	 */
	public materialId:number;

	/**
	 *
	 */
	public renderOrderId:number;

	/**
	 *
	 */
	public zIndex:number;

	/**
	 *
	 */
	public cascaded:boolean;

	/**
	 *
	 */
	public renderSceneTransform:Matrix3D;

	/**
	 *
	 */
	public sourceEntity:IEntity;

	/**
	 *
	 */
	public materialOwner:IMaterialOwner;

	/**
	 *
	 */
	public htmlElement:HTMLElement;

	/**
	 *
	 * @param sourceEntity
	 * @param material
	 * @param animator
	 */
	constructor(pool:RenderablePool, sourceEntity:IEntity, materialOwner:IMaterialOwner)
	{
		//store a reference to the pool for later disposal
		this._pool = pool;

		this.sourceEntity = sourceEntity;
		this.materialOwner = materialOwner;
	}

	/**
	 *
	 */
	public dispose()
	{
		this._pool.disposeItem(this.materialOwner);
	}

	/**
	 *
	 */
	public invalidateGeometry()
	{

	}

	/**
	 *
	 */
	public invalidateIndexData()
	{

	}

	/**
	 *
	 */
	public invalidateVertexData(dataType:string)
	{

	}
}

export = CSSRenderableBase;