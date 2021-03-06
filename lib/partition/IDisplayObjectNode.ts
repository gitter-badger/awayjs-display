import DisplayObject				= require("awayjs-display/lib/base/DisplayObject");
import INode						= require("awayjs-display/lib/partition/INode");

/**
 * IDisplayObjectNode is an interface for the constructable class definition EntityNode that is used to
 * create node objects in the partition pipeline that represent the contents of a Entity
 *
 * @class away.pool.IDisplayObjectNode
 */
interface IDisplayObjectNode extends INode
{
	_iUpdateQueueNext:IDisplayObjectNode;

	displayObject:DisplayObject;

	isContainerNode:boolean;
}

export = IDisplayObjectNode;