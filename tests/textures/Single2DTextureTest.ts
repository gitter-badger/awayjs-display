import BitmapImage2D		= require("awayjs-core/lib/data/BitmapImage2D");
import Rectangle			= require("awayjs-core/lib/geom/Rectangle");
import URLLoader			= require("awayjs-core/lib/net/URLLoader");
import URLLoaderDataFormat	= require("awayjs-core/lib/net/URLLoaderDataFormat");
import URLRequest			= require("awayjs-core/lib/net/URLRequest");
import Event				= require("awayjs-core/lib/events/Event");
import ParserUtils			= require("awayjs-core/lib/parsers/ParserUtils");
import Debug				= require("awayjs-core/lib/utils/Debug");

import Single2DTexture		= require("awayjs-display/lib/textures/Single2DTexture");

class Single2DTextureTest
{

	private mipLoader       : URLLoader;
	private bitmapData      : BitmapImage2D;
	private target          : Single2DTexture;

	constructor()
	{

		//---------------------------------------
		// Load a PNG

		var mipUrlRequest = new URLRequest( 'assets/1024x1024.png');
		this.mipLoader  = new URLLoader();
		this.mipLoader.dataFormat = URLLoaderDataFormat.BLOB;
		this.mipLoader.load( mipUrlRequest );
		this.mipLoader.addEventListener( Event.COMPLETE , (e) => this.mipImgLoaded(e) );

	}

	private mipImgLoaded( e )
	{

		var loader  : URLLoader        = <URLLoader > e.target;
		var image : HTMLImageElement = ParserUtils.blobToImage(loader.data);
		image.onload = ( event ) => this.onImageLoad( event );
	}

	private onImageLoad (event)
	{
		var image : HTMLImageElement = <HTMLImageElement> event.target;

		var rect    : Rectangle       = new Rectangle( 0 , 0 , image.width , image.height );

		console.log( 'Event' , image );

		this.bitmapData = new BitmapImage2D( image.width , image.height );
		this.bitmapData.draw(image);

		this.target = new Single2DTexture(this.bitmapData);

		Debug.log( 'BitmapImage2D'           , this.bitmapData );
		Debug.log( 'Single2DTexture'       , this.target );

	}
}