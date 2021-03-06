import Plane3D						= require("awayjs-core/lib/geom/Plane3D");

import Scene						= require("awayjs-display/lib/containers/Scene");
import EntityListItem				= require("awayjs-display/lib/pool/EntityListItem");
import EntityListItemPool			= require("awayjs-display/lib/pool/EntityListItemPool");
import NodeBase						= require("awayjs-display/lib/partition/NodeBase");
import Camera						= require("awayjs-display/lib/entities/Camera");
import IEntity						= require("awayjs-display/lib/entities/IEntity");

/**
 * @class away.traverse.CollectorBase
 */
class CollectorBase
{
	public scene:Scene;

	public _pEntityHead:EntityListItem;
	public _pEntityListItemPool:EntityListItemPool;
	public _pCamera:Camera;
	private _customCullPlanes:Array<Plane3D>;
	private _cullPlanes:Array<Plane3D>;
	private _numCullPlanes:number = 0;
	public _pNumEntities:number = 0;
	public _pNumInteractiveEntities:number = 0;

	public isEntityCollector:boolean;

	constructor()
	{
		this._pEntityListItemPool = new EntityListItemPool();
	}

	/**
	 *
	 */
	public get camera():Camera
	{
		return this._pCamera;
	}

	public set camera(value:Camera)
	{
		this._pCamera = value;
		this._cullPlanes = this._pCamera.frustumPlanes;
	}

	/**
	 *
	 */
	public get cullPlanes():Array<Plane3D>
	{
		return this._customCullPlanes;
	}

	public set cullPlanes(value:Array<Plane3D>)
	{
		this._customCullPlanes = value;
	}

	/**
	 *
	 */
	public get entityHead():EntityListItem
	{
		return this._pEntityHead;
	}

	/**
	 *
	 */
	public get numEntities():number
	{
		return this._pNumEntities;
	}

	/**
	 *
	 */
	public get numInteractiveEntities():number
	{
		return this._pNumInteractiveEntities;
	}

	/**
	 *
	 */
	public clear()
	{
		this._pNumEntities = this._pNumInteractiveEntities = 0;
		this._cullPlanes = this._customCullPlanes? this._customCullPlanes : ( this._pCamera? this._pCamera.frustumPlanes : null );
		this._numCullPlanes = this._cullPlanes? this._cullPlanes.length : 0;
		this._pEntityHead = null;
		this._pEntityListItemPool.freeAll();
	}

	/**
	 *
	 * @param node
	 * @returns {boolean}
	 */
	public enterNode(node:NodeBase):boolean
	{
		var enter:boolean = this.scene._iCollectionMark != node._iCollectionMark && node.isInFrustum(this._cullPlanes, this._numCullPlanes);

		node._iCollectionMark = this.scene._iCollectionMark;

		return enter;
	}

	/**
	 *
	 * @param entity
	 */
	public applyDirectionalLight(entity:IEntity)
	{
		//don't do anything here
	}

	/**
	 *
	 * @param entity
	 */
	public applyEntity(entity:IEntity)
	{
		this._pNumEntities++;

		if (entity._iIsMouseEnabled())
			this._pNumInteractiveEntities++;

		var item:EntityListItem = this._pEntityListItemPool.getItem();
		item.entity = entity;

		item.next = this._pEntityHead;
		this._pEntityHead = item;
	}

	/**
	 *
	 * @param entity
	 */
	public applyLightProbe(entity:IEntity)
	{
		//don't do anything here
	}

	/**
	 *
	 * @param entity
	 */
	public applyPointLight(entity:IEntity)
	{
		//don't do anything here
	}

	/**
	 *
	 * @param entity
	 */
	public applySkybox(entity:IEntity)
	{
		//don't do anything here
	}
}

export = CollectorBase;