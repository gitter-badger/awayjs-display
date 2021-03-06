import IAsset					= require("awayjs-core/lib/library/IAsset");
import AssetBase				= require("awayjs-core/lib/library/AssetBase");

/**
 * Provides an abstract base class for nodes in an animation blend tree.
 */
class AnimationNodeBase extends AssetBase implements IAsset
{
	public static assetType:string = "[asset AnimationNodeBase]";

	public _pStateClass:any;

	public get stateClass():any
	{
		return this._pStateClass;
	}

	/**
	 * Creates a new <code>AnimationNodeBase</code> object.
	 */
	constructor()
	{
		super();
	}

	/**
	 * @inheritDoc
	 */
	public dispose()
	{
	}

	/**
	 * @inheritDoc
	 */
	public get assetType():string
	{
		return AnimationNodeBase.assetType;
	}
}

export = AnimationNodeBase;