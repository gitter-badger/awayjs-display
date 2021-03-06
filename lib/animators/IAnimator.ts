import IAsset					= require("awayjs-core/lib/library/IAsset");

import IAnimationSet			= require("awayjs-display/lib/animators/IAnimationSet");
import SubGeometryBase			= require("awayjs-display/lib/base/SubGeometryBase");
import IRenderable				= require("awayjs-display/lib/pool/IRenderable");
import IEntity					= require("awayjs-display/lib/entities/IEntity");

/**
 * Provides an interface for animator classes that control animation output from a data set subtype of <code>AnimationSetBase</code>.
 *
 * @see away.animators.IAnimationSet
 */
interface IAnimator extends IAsset
{
	/**
	 *
	 */
	animationSet:IAnimationSet;

	/**
	 *
	 */
	clone():IAnimator;

	/**
	 *
	 */
	dispose();

	/**
	 * Used by the entity object to which the animator is applied, registers the owner for internal use.
	 *
	 * @private
	 */
	addOwner(mesh:IEntity);

	/**
	 * Used by the mesh object from which the animator is removed, unregisters the owner for internal use.
	 *
	 * @private
	 */
	removeOwner(mesh:IEntity);

	/**
	 * //TODO
	 *
	 * @param sourceSubGeometry
	 */
	getRenderableSubGeometry(renderable:IRenderable, sourceSubGeometry:SubGeometryBase):SubGeometryBase;
}

export = IAnimator;