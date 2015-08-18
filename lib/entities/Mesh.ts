﻿import Box							= require("awayjs-core/lib/geom/Box");
import UVTransform					= require("awayjs-core/lib/geom/UVTransform");
import ColorTransform				= require("awayjs-core/lib/geom/ColorTransform");
import Point						= require("awayjs-core/lib/geom/Point");

import IRenderer					= require("awayjs-display/lib/IRenderer");
import IAnimator					= require("awayjs-display/lib/animators/IAnimator");
import DisplayObject				= require("awayjs-display/lib/base/DisplayObject");
import ISubMesh						= require("awayjs-display/lib/base/ISubMesh");
import ISubMeshClass				= require("awayjs-display/lib/base/ISubMeshClass");
import Geometry						= require("awayjs-display/lib/base/Geometry");
import SubGeometryBase				= require("awayjs-display/lib/base/SubGeometryBase");
import CurveSubGeometry				= require("awayjs-display/lib/base/CurveSubGeometry");
import GeometryEvent				= require("awayjs-display/lib/events/GeometryEvent");
import DisplayObjectContainer		= require("awayjs-display/lib/containers/DisplayObjectContainer");
import SubMeshPool					= require("awayjs-display/lib/pool/SubMeshPool");
import IEntity						= require("awayjs-display/lib/entities/IEntity");
import MaterialBase					= require("awayjs-display/lib/materials/MaterialBase");

/**
 * Mesh is an instance of a Geometry, augmenting it with a presence in the scene graph, a material, and an animation
 * state. It consists out of SubMeshes, which in turn correspond to SubGeometries. SubMeshes allow different parts
 * of the geometry to be assigned different materials.
 */
class Mesh extends DisplayObjectContainer implements IEntity
{
	public static assetType:string = "[asset Mesh]";

	private _uvTransform:UVTransform;

	private _subMeshes:Array<ISubMesh>;
	private _geometry:Geometry;
	private _material:MaterialBase;
	private _animator:IAnimator;
	private _castsShadows:boolean = true;
	private _shareAnimationGeometry:boolean = true;

	private _onGeometryBoundsInvalidDelegate:(event:GeometryEvent) => void;
	private _onSubGeometryAddedDelegate:(event:GeometryEvent) => void;
	private _onSubGeometryRemovedDelegate:(event:GeometryEvent) => void;

	//temp point used in hit testing
	private _tempPoint:Point = new Point();
	/**
	 * Defines the animator of the mesh. Act on the mesh's geometry.  Default value is <code>null</code>.
	 */
	public get animator():IAnimator
	{
		return this._animator;
	}

	public set animator(value:IAnimator)
	{
		if (this._animator)
			this._animator.removeOwner(this);

		this._animator = value;

		var len:number = this._subMeshes.length;
		var subMesh:ISubMesh;

		for (var i:number = 0; i < len; ++i) {
			subMesh = this._subMeshes[i];

			// cause material to be unregistered and registered again to work with the new animation type (if possible)
			if (subMesh.material) {
				subMesh.material.iRemoveOwner(subMesh);
				subMesh.material.iAddOwner(subMesh);
			}

			//invalidate any existing renderables in case they need to pull new geometry
			subMesh._iInvalidateRenderableGeometry();
		}

		if (this._animator)
			this._animator.addOwner(this);
	}

	/**
	 *
	 */
	public get assetType():string
	{
		return Mesh.assetType;
	}

	/**
	 * Indicates whether or not the Mesh can cast shadows. Default value is <code>true</code>.
	 */
	public get castsShadows():boolean
	{
		return this._castsShadows;
	}

	public set castsShadows(value:boolean)
	{
		this._castsShadows = value;
	}

	/**
	 * The geometry used by the mesh that provides it with its shape.
	 */
	public get geometry():Geometry
	{
		if (this._iSourcePrefab)
			this._iSourcePrefab._iValidate();

		return this._geometry;
	}

	public set geometry(value:Geometry)
	{
		var i:number;

		if (this._geometry) {
			this._geometry.removeEventListener(GeometryEvent.BOUNDS_INVALID, this._onGeometryBoundsInvalidDelegate);
			this._geometry.removeEventListener(GeometryEvent.SUB_GEOMETRY_ADDED, this._onSubGeometryAddedDelegate);
			this._geometry.removeEventListener(GeometryEvent.SUB_GEOMETRY_REMOVED, this._onSubGeometryRemovedDelegate);

			for (i = 0; i < this._subMeshes.length; ++i)
				this._subMeshes[i].dispose();

			this._subMeshes.length = 0;
		}

		this._geometry = value;

		if (this._geometry) {

			this._geometry.addEventListener(GeometryEvent.BOUNDS_INVALID, this._onGeometryBoundsInvalidDelegate);
			this._geometry.addEventListener(GeometryEvent.SUB_GEOMETRY_ADDED, this._onSubGeometryAddedDelegate);
			this._geometry.addEventListener(GeometryEvent.SUB_GEOMETRY_REMOVED, this._onSubGeometryRemovedDelegate);

			var subGeoms:Array<SubGeometryBase> = this._geometry.subGeometries;

			for (i = 0; i < subGeoms.length; ++i)
				this.addSubMesh(subGeoms[i]);
		}
	}

	/**
	 * The material with which to render the Mesh.
	 */
	public get material():MaterialBase
	{
		return this._material;
	}

	public set material(value:MaterialBase)
	{
		if (value == this._material)
			return;

		var i:number;
		var len:number = this._subMeshes.length;
		var subMesh:ISubMesh;

		for (i = 0; i < len; i++)
			if (this._material && (subMesh = this._subMeshes[i]).material == this._material)
				this._material.iRemoveOwner(subMesh);

		this._material = value;

		for (i = 0; i < len; i++)
			if (this._material && (subMesh = this._subMeshes[i]).material == this._material)
				this._material.iAddOwner(subMesh);
	}

	/**
	 * Indicates whether or not the mesh share the same animation geometry.
	 */
	public get shareAnimationGeometry():boolean
	{
		return this._shareAnimationGeometry;
	}

	public set shareAnimationGeometry(value:boolean)
	{
		this._shareAnimationGeometry = value;
	}

	/**
	 * The SubMeshes out of which the Mesh consists. Every SubMesh can be assigned a material to override the Mesh's
	 * material.
	 */
	public get subMeshes():Array<ISubMesh>
	{
		// Since this getter is invoked every iteration of the render loop, and
		// the prefab construct could affect the sub-meshes, the prefab is
		// validated here to give it a chance to rebuild.
		if (this._iSourcePrefab)
			this._iSourcePrefab._iValidate();

		return this._subMeshes;
	}

	/**
	 *
	 */
	public get uvTransform():UVTransform
	{
		return this._uvTransform;
	}

	public set uvTransform(value:UVTransform)
	{
		this._uvTransform = value;
	}

	/**
	 * Create a new Mesh object.
	 *
	 * @param geometry                    The geometry used by the mesh that provides it with its shape.
	 * @param material    [optional]        The material with which to render the Mesh.
	 */
	constructor(geometry:Geometry, material:MaterialBase = null)
	{
		super();

		this._pIsEntity = true;

		this._subMeshes = new Array<ISubMesh>();

		this._onGeometryBoundsInvalidDelegate = (event:GeometryEvent) => this.onGeometryBoundsInvalid(event);
		this._onSubGeometryAddedDelegate = (event:GeometryEvent) => this.onSubGeometryAdded(event);
		this._onSubGeometryRemovedDelegate = (event:GeometryEvent) => this.onSubGeometryRemoved(event);

		//this should never happen, but if people insist on trying to create their meshes before they have geometry to fill it, it becomes necessary
		this.geometry = geometry || new Geometry();

		this.material = material;
	}

	/**
	 *
	 */
	public bakeTransformations()
	{
		this.geometry.applyTransformation(this._iMatrix3D);
		this._iMatrix3D.identity();
	}

	/**
	 * @inheritDoc
	 */
	public dispose()
	{
		super.dispose();

		this.material = null;
		this.geometry = null;
	}

	/**
	 * Disposes mesh including the animator and children. This is a merely a convenience method.
	 * @return
	 */
	public disposeWithAnimatorAndChildren()
	{
		this.disposeWithChildren();

		 if (this._animator)
			this._animator.dispose();
	}

	/**
	 * Clones this Mesh instance along with all it's children, while re-using the same
	 * material, geometry and animation set. The returned result will be a copy of this mesh,
	 * containing copies of all of it's children.
	 *
	 * Properties that are re-used (i.e. not cloned) by the new copy include name,
	 * geometry, and material. Properties that are cloned or created anew for the copy
	 * include subMeshes, children of the mesh, and the animator.
	 *
	 * If you want to copy just the mesh, reusing it's geometry and material while not
	 * cloning it's children, the simplest way is to create a new mesh manually:
	 *
	 * <code>
	 * var clone : Mesh = new Mesh(original.geometry, original.material);
	 * </code>
	 */
	public clone():DisplayObject
	{
		var clone:Mesh = new Mesh(null, null);

        this._iCopyToMesh(clone);

		return clone;
	}

    public _iCopyToMesh(clone:Mesh):void
    {
        clone.geometry = this._geometry;
        clone.material = this._material;
        clone._iMatrix3D = this._iMatrix3D;
        clone.pivot = this.pivot;
        clone.partition = this.partition;
        clone.boundsType = this.boundsType;


        clone.name = this.name;
        clone.castsShadows = this.castsShadows;
        clone.shareAnimationGeometry = this.shareAnimationGeometry;
        clone.mouseEnabled = this.mouseEnabled;
        clone.mouseChildren = this.mouseChildren;
        //this is of course no proper cloning
        //maybe use this instead?: http://blog.another-d-mention.ro/programming/how-to-clone-duplicate-an-object-in-actionscript-3/
        clone.extra = this.extra;
		clone.maskMode = this.maskMode;
		clone.masks = this.masks? this.masks.concat() : null;

        var len:number = this._subMeshes.length;
        for (var i:number = 0; i < len; ++i)
            clone._subMeshes[i].material = this._subMeshes[i]._iGetExplicitMaterial();


        len = this.numChildren;
        for (i = 0; i < len; ++i)
            clone.addChild(this._children[i].clone());

        if (this._animator)
            clone.animator = this._animator.clone();
    }

	/**
	 * //TODO
	 *
	 * @param subGeometry
	 * @returns {SubMeshBase}
	 */
	public getSubMeshFromSubGeometry(subGeometry:SubGeometryBase):ISubMesh
	{
		return this._subMeshes[this._geometry.subGeometries.indexOf(subGeometry)];
	}

	/**
	 * //TODO
	 *
	 * @protected
	 */
	public _pUpdateBoxBounds()
	{
		super._pUpdateBoxBounds();

		var i:number, j:number, p:number, len:number;
		var subGeoms:Array<SubGeometryBase> = this._geometry.subGeometries;
		var subGeom:SubGeometryBase;
		var boundingPositions:Float32Array;
		var numSubGeoms:number = subGeoms.length;
		var minX:number, minY:number, minZ:number;
		var maxX:number, maxY:number, maxZ:number;
		var tmp_maxZ:number, tmp_minZ:number;

		if (numSubGeoms > 0) {
			i = 0;
			subGeom = subGeoms[0];
			boundingPositions = subGeom.getBoundingPositions();

			if (this.numChildren) {
				maxX = this._pBoxBounds.width + (minX = this._pBoxBounds.x);
				maxY = this._pBoxBounds.height + (minY = this._pBoxBounds.y);
				maxZ = this._pBoxBounds.depth + (minZ = this._pBoxBounds.z);
				tmp_maxZ = this._pBoxBounds.depth + (tmp_minZ = this._pBoxBounds.z);
			} else {
				minX = maxX = boundingPositions[i];
				minY = maxY = boundingPositions[i + 1];
				if(subGeom.isAsset(CurveSubGeometry)){
					minZ = maxZ = 0;
					tmp_minZ = tmp_maxZ = 0;
				}
				else{
					tmp_minZ = tmp_maxZ = boundingPositions[i + 2];
				}
			}

			for (j = 0; j < numSubGeoms; j++) {
				subGeom = subGeoms[j];
				boundingPositions = subGeom.getBoundingPositions();
				len = boundingPositions.length;
				for (i = 0; i < len; i+=3) {
					p = boundingPositions[i];
					if (p < minX)
						minX = p;
					else if (p > maxX)
						maxX = p;

					p = boundingPositions[i + 1];

					if (p < minY)
						minY = p;
					else if (p > maxY)
						maxY = p;

					p = boundingPositions[i + 2];

					if (p < tmp_minZ)
						tmp_minZ = p;
					else if (p > tmp_maxZ)
						tmp_maxZ = p;
				}
				if(!(subGeom.isAsset(CurveSubGeometry))){
					minZ = tmp_minZ;
					maxZ = tmp_maxZ;
				}

			}

			this._pBoxBounds.width = maxX - (this._pBoxBounds.x = minX);
			this._pBoxBounds.height = maxY - (this._pBoxBounds.y = minY);
			this._pBoxBounds.depth = maxZ - (this._pBoxBounds.z = minZ);
		}
	}


	public _pUpdateSphereBounds()
	{
		super._pUpdateSphereBounds();

		var box:Box = this.getBox();
		var centerX:number = box.x + box.width/2;
		var centerY:number = box.y + box.height/2;
		var centerZ:number = box.z + box.depth/2;

		var i:number, j:number, p:number, len:number;
		var subGeoms:Array<SubGeometryBase> = this._geometry.subGeometries;
		var subGeom:SubGeometryBase;
		var boundingPositions:Float32Array;
		var numSubGeoms:number = subGeoms.length;
		var maxRadiusSquared:number = 0;
		var radiusSquared:number;
		var distanceX:number;
		var distanceY:number;
		var distanceZ:number;

		if (numSubGeoms > 0) {
			i = 0;
			subGeom = subGeoms[0];
			boundingPositions = subGeom.getBoundingPositions();
			for (j = 0; j < numSubGeoms; j++) {
				subGeom = subGeoms[j];
				boundingPositions = subGeom.getBoundingPositions();
				len = boundingPositions.length;

				for (i = 0; i < len; i += 3) {
					distanceX = boundingPositions[i] - centerX;
					distanceY = boundingPositions[i + 1] - centerY;
					distanceZ = boundingPositions[i + 2] - centerZ;
					radiusSquared = distanceX*distanceX + distanceY*distanceY + distanceZ*distanceZ;

					if (maxRadiusSquared < radiusSquared)
						maxRadiusSquared = radiusSquared;
				}
			}
		}

		this._pSphereBounds.x = centerX;
		this._pSphereBounds.y = centerY;
		this._pSphereBounds.z = centerZ;
		this._pSphereBounds.radius = Math.sqrt(maxRadiusSquared);
	}

	/**
	 * //TODO
	 *
	 * @private
	 */
	private onGeometryBoundsInvalid(event:GeometryEvent)
	{
		this._pInvalidateBounds();
	}

	/**
	 * Called when a SubGeometry was added to the Geometry.
	 *
	 * @private
	 */
	private onSubGeometryAdded(event:GeometryEvent)
	{
		this.addSubMesh(event.subGeometry);
	}

	/**
	 * Called when a SubGeometry was removed from the Geometry.
	 *
	 * @private
	 */
	private onSubGeometryRemoved(event:GeometryEvent)
	{
		var subMesh:ISubMesh;
		var subGeom:SubGeometryBase = event.subGeometry;
		var len:number = this._subMeshes.length;
		var i:number;

		// Important! This has to be done here, and not delayed until the
		// next render loop, since this may be caused by the geometry being
		// rebuilt IN THE RENDER LOOP. Invalidating and waiting will delay
		// it until the NEXT RENDER FRAME which is probably not desirable.
		for (i = 0; i < len; ++i) {

			subMesh = this._subMeshes[i];

			if (subMesh.subGeometry == subGeom) {
				subMesh.dispose();

				this._subMeshes.splice(i, 1);

				break;
			}
		}

		--len;
		for (; i < len; ++i)
			this._subMeshes[i]._iIndex = i;
	}

	/**
	 * Adds a SubMeshBase wrapping a SubGeometry.
	 *
	 * @param subGeometry
	 */
	private addSubMesh(subGeometry:SubGeometryBase)
	{
		var SubMeshClass:ISubMeshClass = SubMeshPool.getClass(subGeometry);

		var subMesh:ISubMesh = new SubMeshClass(subGeometry, this, null);
		var len:number = this._subMeshes.length;

		subMesh._iIndex = len;

		this._subMeshes[len] = subMesh;

		this._pInvalidateBounds();
	}

	/**
	 * //TODO
	 *
	 * @param shortestCollisionDistance
	 * @param findClosest
	 * @returns {boolean}
	 *
	 * @internal
	 */
	public _iTestCollision(shortestCollisionDistance:number, findClosest:boolean):boolean
	{
		this._pPickingCollisionVO.renderableOwner = null;

		var subMesh:ISubMesh;

		var len:number = this.subMeshes.length;
		for (var i:number = 0; i < len; ++i) {
			subMesh = this.subMeshes[i];

			if (subMesh.subGeometry._iTestCollision(this._pPickingCollider, subMesh.material, this._pPickingCollisionVO, shortestCollisionDistance)) {
				shortestCollisionDistance = this._pPickingCollisionVO.rayEntryDistance;

				this._pPickingCollisionVO.renderableOwner = subMesh;

				if (!findClosest)
					return true;
			}
		}

		return this._pPickingCollisionVO.renderableOwner != null;
	}

	/**
	 *
	 * @param renderer
	 *
	 * @internal
	 */
	public _applyRenderer(renderer:IRenderer)
	{
		// Since this getter is invoked every iteration of the render loop, and
		// the prefab construct could affect the sub-meshes, the prefab is
		// validated here to give it a chance to rebuild.
		if (this._iSourcePrefab)
			this._iSourcePrefab._iValidate();

		var len:number /*uint*/ = this._subMeshes.length;
		for (var i:number /*uint*/ = 0; i < len; i++)
			renderer._iApplyRenderableOwner(this._subMeshes[i]);
	}

	public _iInvalidateRenderableGeometries()
	{
		var len:number = this._subMeshes.length;
		for (var i:number = 0; i < len; ++i)
			this._subMeshes[i]._iInvalidateRenderableGeometry();
	}


	public _hitTestPointInternal(x:number, y:number, shapeFlag:boolean, masksFlag:boolean):boolean
	{
		if(super._hitTestPointInternal(x, y, shapeFlag, masksFlag))
			return true;

		// from this point out, we can not return false, without checking collision of childs.
		this._tempPoint.setTo(x,y);
		var local:Point = this.globalToLocal(this._tempPoint);


		if(this._geometry) {
			if(this.getBox().contains(local.x, local.y, 0)){
				//early out for non-shape tests
				if (!shapeFlag)
					return true;

				var subGeometries:Array<SubGeometryBase> = this._geometry.subGeometries;
				var subGeometriesCount:number = subGeometries.length;
				for(var j:number = 0; j < subGeometriesCount; j++)
					if (subGeometries[j].hitTestPoint(local.x, local.y, 0))
						return true;
			}
		}

		return false;
	}
}

export = Mesh;