/**
 * The PixelSnapping class is an enumeration of constant values for setting
 * the pixel snapping options by using the <code>pixelSnapping</code> property
 * of a Bitmap object.
 */
var PixelSnapping = (function () {
    function PixelSnapping() {
    }
    /**
     * A constant value used in the <code>pixelSnapping</code> property of a
     * Bitmap object to specify that the bitmap image is always snapped to the
     * nearest pixel, independent of any transformation.
     */
    PixelSnapping.ALWAYS = "always";
    /**
     * A constant value used in the <code>pixelSnapping</code> property of a
     * Bitmap object to specify that the bitmap image is snapped to the nearest
     * pixel if it is drawn with no rotation or skew and it is drawn at a scale
     * factor of 99.9% to 100.1%. If these conditions are satisfied, the image is
     * drawn at 100% scale, snapped to the nearest pixel. Internally, this
     * setting allows the image to be drawn as fast as possible by using the
     * vector renderer.
     */
    PixelSnapping.AUTO = "auto";
    /**
     * A constant value used in the <code>pixelSnapping</code> property of a
     * Bitmap object to specify that no pixel snapping occurs.
     */
    PixelSnapping.NEVER = "never";
    return PixelSnapping;
})();
module.exports = PixelSnapping;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1kaXNwbGF5L2xpYi9kcmF3L1BpeGVsU25hcHBpbmcudHMiXSwibmFtZXMiOlsiUGl4ZWxTbmFwcGluZyIsIlBpeGVsU25hcHBpbmcuY29uc3RydWN0b3IiXSwibWFwcGluZ3MiOiJBQUFBLEFBS0E7Ozs7R0FERztJQUNHLGFBQWE7SUFBbkJBLFNBQU1BLGFBQWFBO0lBeUJuQkMsQ0FBQ0E7SUF2QkFEOzs7O09BSUdBO0lBQ1dBLG9CQUFNQSxHQUFVQSxRQUFRQSxDQUFDQTtJQUV2Q0E7Ozs7Ozs7O09BUUdBO0lBQ1dBLGtCQUFJQSxHQUFVQSxNQUFNQSxDQUFDQTtJQUVuQ0E7OztPQUdHQTtJQUNXQSxtQkFBS0EsR0FBVUEsT0FBT0EsQ0FBQ0E7SUFDdENBLG9CQUFDQTtBQUFEQSxDQXpCQSxBQXlCQ0EsSUFBQTtBQUVELEFBQXVCLGlCQUFkLGFBQWEsQ0FBQyIsImZpbGUiOiJkcmF3L1BpeGVsU25hcHBpbmcuanMiLCJzb3VyY2VSb290IjoiLi4vIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGUgUGl4ZWxTbmFwcGluZyBjbGFzcyBpcyBhbiBlbnVtZXJhdGlvbiBvZiBjb25zdGFudCB2YWx1ZXMgZm9yIHNldHRpbmdcbiAqIHRoZSBwaXhlbCBzbmFwcGluZyBvcHRpb25zIGJ5IHVzaW5nIHRoZSA8Y29kZT5waXhlbFNuYXBwaW5nPC9jb2RlPiBwcm9wZXJ0eVxuICogb2YgYSBCaXRtYXAgb2JqZWN0LlxuICovXG5jbGFzcyBQaXhlbFNuYXBwaW5nXG57XG5cdC8qKlxuXHQgKiBBIGNvbnN0YW50IHZhbHVlIHVzZWQgaW4gdGhlIDxjb2RlPnBpeGVsU25hcHBpbmc8L2NvZGU+IHByb3BlcnR5IG9mIGFcblx0ICogQml0bWFwIG9iamVjdCB0byBzcGVjaWZ5IHRoYXQgdGhlIGJpdG1hcCBpbWFnZSBpcyBhbHdheXMgc25hcHBlZCB0byB0aGVcblx0ICogbmVhcmVzdCBwaXhlbCwgaW5kZXBlbmRlbnQgb2YgYW55IHRyYW5zZm9ybWF0aW9uLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBBTFdBWVM6c3RyaW5nID0gXCJhbHdheXNcIjtcblxuXHQvKipcblx0ICogQSBjb25zdGFudCB2YWx1ZSB1c2VkIGluIHRoZSA8Y29kZT5waXhlbFNuYXBwaW5nPC9jb2RlPiBwcm9wZXJ0eSBvZiBhXG5cdCAqIEJpdG1hcCBvYmplY3QgdG8gc3BlY2lmeSB0aGF0IHRoZSBiaXRtYXAgaW1hZ2UgaXMgc25hcHBlZCB0byB0aGUgbmVhcmVzdFxuXHQgKiBwaXhlbCBpZiBpdCBpcyBkcmF3biB3aXRoIG5vIHJvdGF0aW9uIG9yIHNrZXcgYW5kIGl0IGlzIGRyYXduIGF0IGEgc2NhbGVcblx0ICogZmFjdG9yIG9mIDk5LjklIHRvIDEwMC4xJS4gSWYgdGhlc2UgY29uZGl0aW9ucyBhcmUgc2F0aXNmaWVkLCB0aGUgaW1hZ2UgaXNcblx0ICogZHJhd24gYXQgMTAwJSBzY2FsZSwgc25hcHBlZCB0byB0aGUgbmVhcmVzdCBwaXhlbC4gSW50ZXJuYWxseSwgdGhpc1xuXHQgKiBzZXR0aW5nIGFsbG93cyB0aGUgaW1hZ2UgdG8gYmUgZHJhd24gYXMgZmFzdCBhcyBwb3NzaWJsZSBieSB1c2luZyB0aGVcblx0ICogdmVjdG9yIHJlbmRlcmVyLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBBVVRPOnN0cmluZyA9IFwiYXV0b1wiO1xuXG5cdC8qKlxuXHQgKiBBIGNvbnN0YW50IHZhbHVlIHVzZWQgaW4gdGhlIDxjb2RlPnBpeGVsU25hcHBpbmc8L2NvZGU+IHByb3BlcnR5IG9mIGFcblx0ICogQml0bWFwIG9iamVjdCB0byBzcGVjaWZ5IHRoYXQgbm8gcGl4ZWwgc25hcHBpbmcgb2NjdXJzLlxuXHQgKi9cblx0cHVibGljIHN0YXRpYyBORVZFUjpzdHJpbmcgPSBcIm5ldmVyXCI7XG59XG5cbmV4cG9ydCA9IFBpeGVsU25hcHBpbmc7Il19