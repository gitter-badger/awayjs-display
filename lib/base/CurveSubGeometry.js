var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Vector3D = require("awayjs-core/lib/geom/Vector3D");
var SubGeometryBase = require("awayjs-display/lib/base/SubGeometryBase");
var CurveSubMesh = require("awayjs-display/lib/base/CurveSubMesh");
var SubGeometryEvent = require("awayjs-display/lib/events/SubGeometryEvent");
/**
 * @class away.base.CurveSubGeometry
 */
var CurveSubGeometry = (function (_super) {
    __extends(CurveSubGeometry, _super);
    /**
     *
     */
    function CurveSubGeometry(concatenatedArrays) {
        _super.call(this, concatenatedArrays);
        this._positionsDirty = true;
        this._curvesDirty = true;
        this._faceNormalsDirty = true;
        this._faceTangentsDirty = true;
        this._vertexNormalsDirty = true;
        this._vertexTangentsDirty = true;
        this._uvsDirty = true;
        this._secondaryUVsDirty = true;
        this._jointIndicesDirty = true;
        this._jointWeightsDirty = true;
        this._concatenateArrays = true;
        this._autoDeriveNormals = false;
        this._useFaceWeights = false;
        this._autoDeriveUVs = false;
        this._scaleU = 1;
        this._scaleV = 1;
        this._pSubMeshClass = CurveSubMesh;
    }
    Object.defineProperty(CurveSubGeometry.prototype, "scaleU", {
        /**
         *
         */
        get: function () {
            return this._scaleU;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CurveSubGeometry.prototype, "scaleV", {
        /**
         *
         */
        get: function () {
            return this._scaleV;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CurveSubGeometry.prototype, "useCondensedIndices", {
        /**
         * Offers the option of enabling GPU accelerated animation on skeletons larger than 32 joints
         * by condensing the number of joint index values required per mesh. Only applicable to
         * skeleton animations that utilise more than one mesh object. Defaults to false.
         */
        get: function () {
            return this._useCondensedIndices;
        },
        set: function (value) {
            if (this._useCondensedIndices == value)
                return;
            this._useCondensedIndices = value;
        },
        enumerable: true,
        configurable: true
    });
    CurveSubGeometry.prototype._pUpdateStrideOffset = function () {
        if (this._concatenateArrays) {
            this._pOffset[CurveSubGeometry.VERTEX_DATA] = 0;
            //always have positions
            this._pOffset[CurveSubGeometry.POSITION_DATA] = 0;
            var stride = 3;
            if (this._curves != null) {
                this._pOffset[CurveSubGeometry.CURVE_DATA] = stride;
                stride += 2;
            }
            if (this._uvs != null) {
                this._pOffset[CurveSubGeometry.UV_DATA] = stride;
                stride += 2;
            }
            this._pStride[CurveSubGeometry.VERTEX_DATA] = stride;
            this._pStride[CurveSubGeometry.POSITION_DATA] = stride;
            this._pStride[CurveSubGeometry.CURVE_DATA] = stride;
            this._pStride[CurveSubGeometry.UV_DATA] = stride;
            var len = this._pNumVertices * stride;
            if (this._pVertices == null)
                this._pVertices = new Array(len);
            else if (this._pVertices.length != len)
                this._pVertices.length = len;
        }
        else {
            this._pOffset[CurveSubGeometry.POSITION_DATA] = 0;
            this._pOffset[CurveSubGeometry.CURVE_DATA] = 0;
            this._pOffset[CurveSubGeometry.UV_DATA] = 0;
            this._pStride[CurveSubGeometry.POSITION_DATA] = 3;
            this._pStride[CurveSubGeometry.CURVE_DATA] = 2;
            this._pStride[CurveSubGeometry.UV_DATA] = 2;
        }
        this._pStrideOffsetDirty = false;
    };
    Object.defineProperty(CurveSubGeometry.prototype, "autoDeriveUVs", {
        /**
         * Defines whether a UV buffer should be automatically generated to contain dummy UV coordinates.
         * Set to true if a geometry lacks UV data but uses a material that requires it, or leave as false
         * in cases where UV data is explicitly defined or the material does not require UV data.
         */
        get: function () {
            return false; //this._autoDeriveUVs;
        },
        set: function (value) {
            //if (this._autoDeriveUVs == value)
            return;
            //this._autoDeriveUVs = value;
            if (value)
                this.notifyUVsUpdate();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CurveSubGeometry.prototype, "autoDeriveNormals", {
        /**
         * True if the vertex normals should be derived from the geometry, false if the vertex normals are set
         * explicitly.
         */
        get: function () {
            return this._autoDeriveNormals;
        },
        //remove
        set: function (value) {
            if (this._autoDeriveNormals == value)
                return;
            this._autoDeriveNormals = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CurveSubGeometry.prototype, "vertices", {
        /**
         *
         */
        get: function () {
            if (this._positionsDirty)
                this.updatePositions(this._positions);
            if (this._curvesDirty)
                this.updateCurves(this._curves);
            if (this._uvsDirty)
                this.updateUVs(this._uvs);
            return this._pVertices;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CurveSubGeometry.prototype, "positions", {
        /**
         *
         */
        get: function () {
            if (this._positionsDirty)
                this.updatePositions(this._positions);
            return this._positions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CurveSubGeometry.prototype, "curves", {
        /**
         *
         */
        get: function () {
            if (this._curvesDirty)
                this.updateCurves(this._curves);
            return this._curves;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CurveSubGeometry.prototype, "faceNormals", {
        /**
         * The raw data of the face normals, in the same order as the faces are listed in the index list.
         */
        get: function () {
            if (this._faceNormalsDirty)
                this.updateFaceNormals();
            return this._faceNormals;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CurveSubGeometry.prototype, "uvs", {
        /**
         *
         */
        get: function () {
            if (this._uvsDirty)
                this.updateUVs(this._uvs);
            return this._uvs;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CurveSubGeometry.prototype, "useFaceWeights", {
        /**
         * Indicates whether or not to take the size of faces into account when auto-deriving vertex normals and tangents.
         */
        get: function () {
            return this._useFaceWeights;
        },
        set: function (value) {
            if (this._useFaceWeights == value)
                return;
            this._useFaceWeights = value;
            this._faceNormalsDirty = true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CurveSubGeometry.prototype, "condensedIndexLookUp", {
        get: function () {
            return this._condensedIndexLookUp;
        },
        enumerable: true,
        configurable: true
    });
    CurveSubGeometry.prototype.getBoundingPositions = function () {
        if (this._positionsDirty)
            this.updatePositions(this._positions);
        return this._positions;
    };
    /**
     *
     */
    CurveSubGeometry.prototype.updatePositions = function (values) {
        var i;
        var index;
        var stride;
        var positions;
        this._positions = values;
        if (this._positions == null)
            this._positions = new Array();
        this._pNumVertices = this._positions.length / 3;
        if (this._concatenateArrays) {
            var len = this._pNumVertices * this.getStride(CurveSubGeometry.VERTEX_DATA);
            if (this._pVertices == null)
                this._pVertices = new Array(len);
            else if (this._pVertices.length != len)
                this._pVertices.length = len;
            i = 0;
            index = this.getOffset(CurveSubGeometry.POSITION_DATA);
            stride = this.getStride(CurveSubGeometry.POSITION_DATA);
            positions = this._pVertices;
            while (i < values.length) {
                positions[index] = values[i++];
                positions[index + 1] = values[i++];
                positions[index + 2] = values[i++];
                index += stride;
            }
        }
        this.pInvalidateBounds();
        this.notifyPositionsUpdate();
        this._positionsDirty = false;
    };
    /**
     * Updates the vertex normals based on the geometry.
     */
    CurveSubGeometry.prototype.updateCurves = function (values) {
        var i;
        var index;
        var offset;
        var stride;
        var curves;
        if (true) {
            if ((this._curves == null || values == null) && (this._curves != null || values != null)) {
                if (this._concatenateArrays)
                    true; //"do nothing";
                else
                    this._pStrideOffsetDirty = true;
            }
            this._curves = values;
            if (values != null && this._concatenateArrays) {
                i = 0;
                index = this.getOffset(CurveSubGeometry.CURVE_DATA);
                stride = this.getStride(CurveSubGeometry.CURVE_DATA);
                curves = this._pVertices;
                while (i < values.length) {
                    curves[index] = values[i++];
                    curves[index + 1] = values[i++];
                    index += stride;
                }
            }
        }
        this.notifyCurvesUpdate();
        this._curvesDirty = false;
    };
    /**
     * Updates the uvs based on the geometry.
     */
    CurveSubGeometry.prototype.updateUVs = function (values) {
        var i;
        var index;
        var offset;
        var stride;
        var uvs;
        if (!this._autoDeriveUVs) {
            if ((this._uvs == null || values == null) && (this._uvs != null || values != null)) {
                if (this._concatenateArrays)
                    this._pNotifyVerticesUpdate();
                else
                    this._pStrideOffsetDirty = true;
            }
            this._uvs = values;
            if (values != null && this._concatenateArrays) {
                i = 0;
                index = this.getOffset(CurveSubGeometry.UV_DATA);
                stride = this.getStride(CurveSubGeometry.UV_DATA);
                uvs = this._pVertices;
                while (i < values.length) {
                    uvs[index] = values[i++];
                    uvs[index + 1] = values[i++];
                    index += stride;
                }
            }
        }
        else {
            if (this._uvs == null) {
                this._uvs = new Array(this._positions.length * 2 / 3);
                if (this._concatenateArrays)
                    this._pNotifyVerticesUpdate();
                else
                    this._pStrideOffsetDirty = true;
            }
            offset = this.getOffset(CurveSubGeometry.UV_DATA);
            stride = this.getStride(CurveSubGeometry.UV_DATA);
            //autoderived uvs
            uvs = this._concatenateArrays ? this._pVertices : this._uvs;
            i = 0;
            index = offset;
            var uvIdx = 0;
            //clear uv values
            var lenV = uvs.length;
            while (index < lenV) {
                if (this._concatenateArrays) {
                    this._uvs[i++] = uvs[index] = uvIdx * .5;
                    this._uvs[i++] = uvs[index + 1] = 1.0 - (uvIdx & 1);
                }
                else {
                    uvs[index] = uvIdx * .5;
                    uvs[index + 1] = 1.0 - (uvIdx & 1);
                }
                if (++uvIdx == 3)
                    uvIdx = 0;
                index += stride;
            }
        }
        this.notifyUVsUpdate();
        this._uvsDirty = false;
    };
    /**
     *
     */
    CurveSubGeometry.prototype.dispose = function () {
        _super.prototype.dispose.call(this);
        this._positions = null;
        this._curves = null;
        this._uvs = null;
        this._faceNormals = null;
        this._faceWeights = null;
        this._faceTangents = null;
    };
    /**
     * Updates the face indices of the CurveSubGeometry.
     *
     * @param indices The face indices to upload.
     */
    CurveSubGeometry.prototype.updateIndices = function (indices) {
        _super.prototype.updateIndices.call(this, indices);
        this._faceNormalsDirty = true;
        if (this._autoDeriveNormals)
            this._vertexNormalsDirty = true;
    };
    /**
     * Clones the current object
     * @return An exact duplicate of the current object.
     */
    CurveSubGeometry.prototype.clone = function () {
        var clone = new CurveSubGeometry(this._concatenateArrays);
        clone.updateIndices(this._pIndices.concat());
        clone.updatePositions(this._positions.concat());
        if (this._curves)
            clone.updateCurves(this._curves.concat());
        else
            clone.updateCurves(null);
        if (this._uvs && !this._autoDeriveUVs)
            clone.updateUVs(this._uvs.concat());
        else
            clone.updateUVs(null);
        return clone;
    };
    CurveSubGeometry.prototype.scaleUV = function (scaleU, scaleV) {
        if (scaleU === void 0) { scaleU = 1; }
        if (scaleV === void 0) { scaleV = 1; }
        var index;
        var offset;
        var stride;
        var uvs;
        uvs = this._uvs;
        var ratioU = scaleU / this._scaleU;
        var ratioV = scaleV / this._scaleV;
        this._scaleU = scaleU;
        this._scaleV = scaleV;
        var len = uvs.length;
        offset = 0;
        stride = 2;
        index = offset;
        while (index < len) {
            uvs[index] *= ratioU;
            uvs[index + 1] *= ratioV;
            index += stride;
        }
        this.notifyUVsUpdate();
    };
    /**
     * Scales the geometry.
     * @param scale The amount by which to scale.
     */
    CurveSubGeometry.prototype.scale = function (scale) {
        var i;
        var index;
        var offset;
        var stride;
        var positions;
        positions = this._positions;
        var len = positions.length;
        offset = 0;
        stride = 3;
        i = 0;
        index = offset;
        while (i < len) {
            positions[index] *= scale;
            positions[index + 1] *= scale;
            positions[index + 2] *= scale;
            i += 3;
            index += stride;
        }
        this.notifyPositionsUpdate();
    };
    CurveSubGeometry.prototype.applyTransformation = function (transform) {
        var positions;
        if (this._concatenateArrays) {
            positions = this._pVertices;
        }
        else {
            positions = this._positions;
        }
        var len = this._positions.length / 3;
        var i;
        var i1;
        var i2;
        var vector = new Vector3D();
        var invTranspose;
        var vi0 = this.getOffset(CurveSubGeometry.POSITION_DATA);
        var vStride = this.getStride(CurveSubGeometry.POSITION_DATA);
        for (i = 0; i < len; ++i) {
            i1 = vi0 + 1;
            i2 = vi0 + 2;
            // bake position
            vector.x = positions[vi0];
            vector.y = positions[i1];
            vector.z = positions[i2];
            vector = transform.transformVector(vector);
            positions[vi0] = vector.x;
            positions[i1] = vector.y;
            positions[i2] = vector.z;
            vi0 += vStride;
        }
        this.notifyPositionsUpdate();
    };
    /**
     * Updates the normals for each face.
     */
    CurveSubGeometry.prototype.updateFaceNormals = function () {
        var i = 0;
        var j = 0;
        var k = 0;
        var index;
        var offset;
        var stride;
        var x1, x2, x3;
        var y1, y2, y3;
        var z1, z2, z3;
        var dx1, dy1, dz1;
        var dx2, dy2, dz2;
        var cx, cy, cz;
        var d;
        var positions = this._positions;
        var len = this._pIndices.length;
        if (this._faceNormals == null)
            this._faceNormals = new Array(len);
        if (this._useFaceWeights && this._faceWeights == null)
            this._faceWeights = new Array(len / 3);
        while (i < len) {
            index = this._pIndices[i++] * 3;
            x1 = positions[index];
            y1 = positions[index + 1];
            z1 = positions[index + 2];
            index = this._pIndices[i++] * 3;
            x2 = positions[index];
            y2 = positions[index + 1];
            z2 = positions[index + 2];
            index = this._pIndices[i++] * 3;
            x3 = positions[index];
            y3 = positions[index + 1];
            z3 = positions[index + 2];
            dx1 = x3 - x1;
            dy1 = y3 - y1;
            dz1 = z3 - z1;
            dx2 = x2 - x1;
            dy2 = y2 - y1;
            dz2 = z2 - z1;
            cx = dz1 * dy2 - dy1 * dz2;
            cy = dx1 * dz2 - dz1 * dx2;
            cz = dy1 * dx2 - dx1 * dy2;
            d = Math.sqrt(cx * cx + cy * cy + cz * cz);
            // length of cross product = 2*triangle area
            if (this._useFaceWeights) {
                var w = d * 10000;
                if (w < 1)
                    w = 1;
                this._faceWeights[k++] = w;
            }
            d = 1 / d;
            this._faceNormals[j++] = cx * d;
            this._faceNormals[j++] = cy * d;
            this._faceNormals[j++] = cz * d;
        }
        this._faceNormalsDirty = false;
    };
    CurveSubGeometry.prototype._pNotifyVerticesUpdate = function () {
        this._pStrideOffsetDirty = true;
        this.notifyPositionsUpdate();
        this.notifyCurvesUpdate();
        this.notifyUVsUpdate();
    };
    CurveSubGeometry.prototype.notifyPositionsUpdate = function () {
        if (this._positionsDirty)
            return;
        this._positionsDirty = true;
        if (!this._positionsUpdated)
            this._positionsUpdated = new SubGeometryEvent(SubGeometryEvent.VERTICES_UPDATED, CurveSubGeometry.POSITION_DATA);
        this.dispatchEvent(this._positionsUpdated);
    };
    CurveSubGeometry.prototype.notifyCurvesUpdate = function () {
        if (this._curvesDirty)
            return;
        this._curvesDirty = true;
        if (!this._curvesUpdated)
            this._curvesUpdated = new SubGeometryEvent(SubGeometryEvent.VERTICES_UPDATED, CurveSubGeometry.CURVE_DATA);
        this.dispatchEvent(this._curvesUpdated);
    };
    CurveSubGeometry.prototype.notifyUVsUpdate = function () {
        if (this._uvsDirty)
            return;
        this._uvsDirty = true;
        if (!this._uvsUpdated)
            this._uvsUpdated = new SubGeometryEvent(SubGeometryEvent.VERTICES_UPDATED, CurveSubGeometry.UV_DATA);
        this.dispatchEvent(this._uvsUpdated);
    };
    CurveSubGeometry.POSITION_DATA = "positions";
    CurveSubGeometry.CURVE_DATA = "curves";
    CurveSubGeometry.UV_DATA = "uvs";
    //TODO - move these to StageGL
    CurveSubGeometry.POSITION_FORMAT = "float3";
    CurveSubGeometry.CURVE_FORMAT = "float2";
    CurveSubGeometry.UV_FORMAT = "float2";
    return CurveSubGeometry;
})(SubGeometryBase);
module.exports = CurveSubGeometry;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF3YXlqcy1kaXNwbGF5L2xpYi9iYXNlL0N1cnZlU3ViR2VvbWV0cnkudHMiXSwibmFtZXMiOlsiQ3VydmVTdWJHZW9tZXRyeSIsIkN1cnZlU3ViR2VvbWV0cnkuY29uc3RydWN0b3IiLCJDdXJ2ZVN1Ykdlb21ldHJ5LnNjYWxlVSIsIkN1cnZlU3ViR2VvbWV0cnkuc2NhbGVWIiwiQ3VydmVTdWJHZW9tZXRyeS51c2VDb25kZW5zZWRJbmRpY2VzIiwiQ3VydmVTdWJHZW9tZXRyeS5fcFVwZGF0ZVN0cmlkZU9mZnNldCIsIkN1cnZlU3ViR2VvbWV0cnkuYXV0b0Rlcml2ZVVWcyIsIkN1cnZlU3ViR2VvbWV0cnkuYXV0b0Rlcml2ZU5vcm1hbHMiLCJDdXJ2ZVN1Ykdlb21ldHJ5LnZlcnRpY2VzIiwiQ3VydmVTdWJHZW9tZXRyeS5wb3NpdGlvbnMiLCJDdXJ2ZVN1Ykdlb21ldHJ5LmN1cnZlcyIsIkN1cnZlU3ViR2VvbWV0cnkuZmFjZU5vcm1hbHMiLCJDdXJ2ZVN1Ykdlb21ldHJ5LnV2cyIsIkN1cnZlU3ViR2VvbWV0cnkudXNlRmFjZVdlaWdodHMiLCJDdXJ2ZVN1Ykdlb21ldHJ5LmNvbmRlbnNlZEluZGV4TG9va1VwIiwiQ3VydmVTdWJHZW9tZXRyeS5nZXRCb3VuZGluZ1Bvc2l0aW9ucyIsIkN1cnZlU3ViR2VvbWV0cnkudXBkYXRlUG9zaXRpb25zIiwiQ3VydmVTdWJHZW9tZXRyeS51cGRhdGVDdXJ2ZXMiLCJDdXJ2ZVN1Ykdlb21ldHJ5LnVwZGF0ZVVWcyIsIkN1cnZlU3ViR2VvbWV0cnkuZGlzcG9zZSIsIkN1cnZlU3ViR2VvbWV0cnkudXBkYXRlSW5kaWNlcyIsIkN1cnZlU3ViR2VvbWV0cnkuY2xvbmUiLCJDdXJ2ZVN1Ykdlb21ldHJ5LnNjYWxlVVYiLCJDdXJ2ZVN1Ykdlb21ldHJ5LnNjYWxlIiwiQ3VydmVTdWJHZW9tZXRyeS5hcHBseVRyYW5zZm9ybWF0aW9uIiwiQ3VydmVTdWJHZW9tZXRyeS51cGRhdGVGYWNlTm9ybWFscyIsIkN1cnZlU3ViR2VvbWV0cnkuX3BOb3RpZnlWZXJ0aWNlc1VwZGF0ZSIsIkN1cnZlU3ViR2VvbWV0cnkubm90aWZ5UG9zaXRpb25zVXBkYXRlIiwiQ3VydmVTdWJHZW9tZXRyeS5ub3RpZnlDdXJ2ZXNVcGRhdGUiLCJDdXJ2ZVN1Ykdlb21ldHJ5Lm5vdGlmeVVWc1VwZGF0ZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQ0EsSUFBTyxRQUFRLFdBQWUsK0JBQStCLENBQUMsQ0FBQztBQUUvRCxJQUFPLGVBQWUsV0FBYSx5Q0FBeUMsQ0FBQyxDQUFDO0FBQzlFLElBQU8sWUFBWSxXQUFpQixzQ0FBc0MsQ0FBQyxDQUFDO0FBQzVFLElBQU8sZ0JBQWdCLFdBQWEsNENBQTRDLENBQUMsQ0FBQztBQUVsRixBQUdBOztHQURHO0lBQ0csZ0JBQWdCO0lBQVNBLFVBQXpCQSxnQkFBZ0JBLFVBQXdCQTtJQThRN0NBOztPQUVHQTtJQUNIQSxTQWpSS0EsZ0JBQWdCQSxDQWlSVEEsa0JBQTBCQTtRQUVyQ0Msa0JBQU1BLGtCQUFrQkEsQ0FBQ0EsQ0FBQ0E7UUF4UW5CQSxvQkFBZUEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDL0JBLGlCQUFZQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUM1QkEsc0JBQWlCQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUNqQ0EsdUJBQWtCQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUNsQ0Esd0JBQW1CQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUNuQ0EseUJBQW9CQSxHQUFXQSxJQUFJQSxDQUFDQTtRQUNwQ0EsY0FBU0EsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDekJBLHVCQUFrQkEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDbENBLHVCQUFrQkEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDbENBLHVCQUFrQkEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFZbENBLHVCQUFrQkEsR0FBV0EsSUFBSUEsQ0FBQ0E7UUFDbENBLHVCQUFrQkEsR0FBV0EsS0FBS0EsQ0FBQ0E7UUFDbkNBLG9CQUFlQSxHQUFXQSxLQUFLQSxDQUFDQTtRQUM3QkEsbUJBQWNBLEdBQVdBLEtBQUtBLENBQUNBO1FBTWxDQSxZQUFPQSxHQUFVQSxDQUFDQSxDQUFDQTtRQUNuQkEsWUFBT0EsR0FBVUEsQ0FBQ0EsQ0FBQ0E7UUEyTzFCQSxJQUFJQSxDQUFDQSxjQUFjQSxHQUFHQSxZQUFZQSxDQUFDQTtJQUNwQ0EsQ0FBQ0E7SUFoT0RELHNCQUFXQSxvQ0FBTUE7UUFIakJBOztXQUVHQTthQUNIQTtZQUVDRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxPQUFPQSxDQUFDQTtRQUNyQkEsQ0FBQ0E7OztPQUFBRjtJQUtEQSxzQkFBV0Esb0NBQU1BO1FBSGpCQTs7V0FFR0E7YUFDSEE7WUFFQ0csTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsT0FBT0EsQ0FBQ0E7UUFDckJBLENBQUNBOzs7T0FBQUg7SUFPREEsc0JBQVdBLGlEQUFtQkE7UUFMOUJBOzs7O1dBSUdBO2FBQ0hBO1lBRUNJLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLG9CQUFvQkEsQ0FBQ0E7UUFDbENBLENBQUNBO2FBRURKLFVBQStCQSxLQUFhQTtZQUUzQ0ksRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0Esb0JBQW9CQSxJQUFJQSxLQUFLQSxDQUFDQTtnQkFDdENBLE1BQU1BLENBQUNBO1lBRVJBLElBQUlBLENBQUNBLG9CQUFvQkEsR0FBR0EsS0FBS0EsQ0FBQ0E7UUFDbkNBLENBQUNBOzs7T0FSQUo7SUFVTUEsK0NBQW9CQSxHQUEzQkE7UUFFQ0ssRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0Esa0JBQWtCQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM3QkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxXQUFXQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUVoREEsQUFDQUEsdUJBRHVCQTtZQUN2QkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxhQUFhQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUNsREEsSUFBSUEsTUFBTUEsR0FBVUEsQ0FBQ0EsQ0FBQ0E7WUFFdEJBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLE9BQU9BLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO2dCQUMxQkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxVQUFVQSxDQUFDQSxHQUFHQSxNQUFNQSxDQUFDQTtnQkFDcERBLE1BQU1BLElBQUlBLENBQUNBLENBQUNBO1lBQ2JBLENBQUNBO1lBRURBLEVBQUVBLENBQUNBLENBQUNBLElBQUlBLENBQUNBLElBQUlBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO2dCQUN2QkEsSUFBSUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxPQUFPQSxDQUFDQSxHQUFHQSxNQUFNQSxDQUFDQTtnQkFDakRBLE1BQU1BLElBQUlBLENBQUNBLENBQUNBO1lBQ2JBLENBQUNBO1lBSURBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsR0FBR0EsTUFBTUEsQ0FBQ0E7WUFDckRBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsR0FBR0EsTUFBTUEsQ0FBQ0E7WUFDdkRBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsR0FBR0EsTUFBTUEsQ0FBQ0E7WUFDcERBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsTUFBTUEsQ0FBQ0E7WUFFakRBLElBQUlBLEdBQUdBLEdBQVVBLElBQUlBLENBQUNBLGFBQWFBLEdBQUNBLE1BQU1BLENBQUNBO1lBRTNDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxJQUFJQSxJQUFJQSxDQUFDQTtnQkFDM0JBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLEtBQUtBLENBQVNBLEdBQUdBLENBQUNBLENBQUNBO1lBQzFDQSxJQUFJQSxDQUFDQSxFQUFF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QSxnQkFBZ0JBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO1lBRWpGQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxJQUFJQSxJQUFJQSxDQUFDQTtnQkFDM0JBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLEtBQUtBLENBQVNBLEdBQUdBLENBQUNBLENBQUNBO1lBQzFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQSxNQUFNQSxJQUFJQSxHQUFHQSxDQUFDQTtnQkFDdENBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBLE1BQU1BLEdBQUdBLEdBQUdBLENBQUNBO1lBRTlCQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUNOQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxnQkFBZ0JBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO1lBQ3ZEQSxNQUFNQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxnQkFBZ0JBLENBQUNBLGFBQWFBLENBQUNBLENBQUNBO1lBQ3hEQSxTQUFTQSxHQUFHQSxJQUFJQSxDQUFDQSxVQUFVQSxDQUFDQTtZQUU1QkEsT0FBT0EsQ0FBQ0EsR0FBR0EsTUFBTUEsQ0FBQ0EsTUFBTUEsRUFBRUEsQ0FBQ0E7Z0JBQzFCQSxTQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxNQUFNQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQTtnQkFDL0JBLFNBQVNBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLEdBQUdBLE1BQU1BLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBO2dCQUNuQ0EsU0FBU0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsTUFBTUEsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7Z0JBQ25DQSxLQUFLQSxJQUFJQSxNQUFNQSxDQUFDQTtZQUNqQkEsQ0FBQ0E7UUFDRkEsQ0FBQ0E7UUFFREEsSUFBSUEsQ0FB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QSxFQUFTQSxDQUFDQTtRQUNwQ0EsSUFBSUEsQ0FBUUEsQ0FBQ0E7UUFFYkEsSUFBSUEsU0FBU0EsR0FBaUJBLElBQUlBLENBQUNBLFVBQVVBLENBQUNBO1FBRTlDQSxJQUFJQSxHQUFHQSxHQUFVQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxNQUFNQSxDQUFDQTtRQUV2Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsSUFBSUEsSUFBSUEsQ0FBQ0E7WUFDN0JBLElBQUlBLENBQUNBLFlBQVlBLEdBQUdBLElBQUlBLEtBQUtBLENBQVNBLEdBQUdBLENBQUNBLENBQUNBO1FBRTVDQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxlQUFlQSxJQUFJQSxJQUFJQSxDQUFDQSxZQUFZQSxJQUFJQSxJQUFJQSxDQUFDQTtZQUNyREEsSUFBSUEsQ0FBQ0EsWUFBWUEsR0FBR0EsSUFBSUEsS0FBS0EsQ0FBU0EsR0FBR0EsR0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFFOUNBLE9BQU9BLENBQUNBLEdBQUdBLEdBQUdBLEVBQUVBLENBQUNBO1lBQ2hCQSxLQUFLQSxHQUFHQSxJQUFJQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFDQSxDQUFDQSxDQUFDQTtZQUM5QkEsRUFBRUEsR0FBR0EsU0FBU0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsQ0FBQ0E7WUFDdEJBLEVBQUVBLEdBQUdBLFNBQVNBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1lBQzFCQSxFQUFFQSxHQUFHQSxTQUFTQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMxQkEsS0FBS0EsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsRUFBRUEsQ0FBQ0EsR0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDOUJBLEVBQUVBLEdBQUdBLFNBQVNBLENBQUNBLEtBQUtBLENBQUNBLENBQUNBO1lBQ3RCQSxFQUFFQSxHQUFHQSxTQUFTQSxDQUFDQSxLQUFLQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUMxQkEsRUFBRUEsR0FBR0EsU0FBU0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDMUJBLEtBQUtBLEdBQUdBLElBQUlBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBLEdBQUNBLENBQUNBLENBQUNBO1lBQzlCQSxFQUFFQSxHQUFHQSxTQUFTQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQTtZQUN0QkEsRUFBRUEsR0FBR0EsU0FBU0EsQ0FBQ0EsS0FBS0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDMUJBLEVBQUVBLEdBQUdBLFNBQVNBLENBQUNBLEtBQUtBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBO1lBQzFCQSxHQUFHQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQTtZQUNkQSxHQUFHQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQTtZQUNkQSxHQUFHQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQTtZQUNkQSxHQUFHQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQTtZQUNkQSxHQUFHQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQTtZQUNkQSxHQUFHQSxHQUFHQSxFQUFFQSxHQUFHQSxFQUFFQSxDQUFDQTtZQUNkQSxFQUFFQSxHQUFHQSxHQUFHQSxHQUFDQSxHQUFHQSxHQUFHQSxHQUFHQSxHQUFDQSxHQUFHQSxDQUFDQTtZQUN2QkEsRUFBRUEsR0FBR0EsR0FBR0EsR0FBQ0EsR0FBR0EsR0FBR0EsR0FBR0EsR0FBQ0EsR0FBR0EsQ0FBQ0E7WUFDdkJBLEVBQUVBLEdBQUdBLEdBQUdBLEdBQUNBLEdBQUdBLEdBQUdBLEdBQUdBLEdBQUNBLEdBQUdBLENBQUNBO1lBQ3ZCQSxDQUFDQSxHQUFHQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxHQUFDQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFDQSxFQUFFQSxHQUFHQSxFQUFFQSxHQUFDQSxFQUFFQSxDQUFD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QVdBLEdBQUdBLElBQUlBLGdCQUFnQkEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQSxnQkFBZ0JBLEVBQUVBLGdCQUFnQkEsQ0FBQ0EsT0FBT0EsQ0FBQ0EsQ0FBQ0E7UUFFekdBLElBQUlBLENBQUNBLGFBQWFBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBO0lBQ3pDQSxDQUFDQTtJQWx1QlU3Qiw4QkFBYUEsR0FBVUEsV0FBV0EsQ0FBQ0E7SUFDaENBLDJCQUFVQSxHQUFVQSxRQUFRQSxDQUFDQTtJQUNoQ0Esd0JBQU9BLEdBQVVBLEtBQUtBLENBQUNBO0lBRXJDQSw4QkFBOEJBO0lBQ2hCQSxnQ0FBZUEsR0FBVUEsUUFBUUEsQ0FBQ0E7SUFDbENBLDZCQUFZQSxHQUFVQSxRQUFRQSxDQUFDQTtJQUMvQkEsMEJBQVNBLEdBQVVBLFFBQVFBLENBQUNBO0lBNHRCM0NBLHVCQUFDQTtBQUFEQSxDQXJ1QkEsQUFxdUJDQSxFQXJ1QjhCLGVBQWUsRUFxdUI3QztBQUVELEFBQTBCLGlCQUFqQixnQkFBZ0IsQ0FBQyIsImZpbGUiOiJiYXNlL0N1cnZlU3ViR2VvbWV0cnkuanMiLCJzb3VyY2VSb290IjoiLi4vIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE1hdHJpeDNEXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL01hdHJpeDNEXCIpO1xuaW1wb3J0IFZlY3RvcjNEXHRcdFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1jb3JlL2xpYi9nZW9tL1ZlY3RvcjNEXCIpO1xuXG5pbXBvcnQgU3ViR2VvbWV0cnlCYXNlXHRcdFx0PSByZXF1aXJlKFwiYXdheWpzLWRpc3BsYXkvbGliL2Jhc2UvU3ViR2VvbWV0cnlCYXNlXCIpO1xuaW1wb3J0IEN1cnZlU3ViTWVzaFx0XHQgICAgXHQ9IHJlcXVpcmUoXCJhd2F5anMtZGlzcGxheS9saWIvYmFzZS9DdXJ2ZVN1Yk1lc2hcIik7XG5pbXBvcnQgU3ViR2VvbWV0cnlFdmVudFx0XHRcdD0gcmVxdWlyZShcImF3YXlqcy1kaXNwbGF5L2xpYi9ldmVudHMvU3ViR2VvbWV0cnlFdmVudFwiKTtcblxuLyoqXG4gKiBAY2xhc3MgYXdheS5iYXNlLkN1cnZlU3ViR2VvbWV0cnlcbiAqL1xuY2xhc3MgQ3VydmVTdWJHZW9tZXRyeSBleHRlbmRzIFN1Ykdlb21ldHJ5QmFzZVxue1xuXHRwdWJsaWMgc3RhdGljIFBPU0lUSU9OX0RBVEE6c3RyaW5nID0gXCJwb3NpdGlvbnNcIjtcbiAgICBwdWJsaWMgc3RhdGljIENVUlZFX0RBVEE6c3RyaW5nID0gXCJjdXJ2ZXNcIjtcblx0cHVibGljIHN0YXRpYyBVVl9EQVRBOnN0cmluZyA9IFwidXZzXCI7XG5cblx0Ly9UT0RPIC0gbW92ZSB0aGVzZSB0byBTdGFnZUdMXG5cdHB1YmxpYyBzdGF0aWMgUE9TSVRJT05fRk9STUFUOnN0cmluZyA9IFwiZmxvYXQzXCI7XG5cdHB1YmxpYyBzdGF0aWMgQ1VSVkVfRk9STUFUOnN0cmluZyA9IFwiZmxvYXQyXCI7XG5cdHB1YmxpYyBzdGF0aWMgVVZfRk9STUFUOnN0cmluZyA9IFwiZmxvYXQyXCI7XG5cblx0cHJpdmF0ZSBfcG9zaXRpb25zRGlydHk6Ym9vbGVhbiA9IHRydWU7XG5cdHByaXZhdGUgX2N1cnZlc0RpcnR5OmJvb2xlYW4gPSB0cnVlO1xuXHRwcml2YXRlIF9mYWNlTm9ybWFsc0RpcnR5OmJvb2xlYW4gPSB0cnVlO1xuXHRwcml2YXRlIF9mYWNlVGFuZ2VudHNEaXJ0eTpib29sZWFuID0gdHJ1ZTtcblx0cHJpdmF0ZSBfdmVydGV4Tm9ybWFsc0RpcnR5OmJvb2xlYW4gPSB0cnVlO1xuXHRwcml2YXRlIF92ZXJ0ZXhUYW5nZW50c0RpcnR5OmJvb2xlYW4gPSB0cnVlO1xuXHRwcml2YXRlIF91dnNEaXJ0eTpib29sZWFuID0gdHJ1ZTtcblx0cHJpdmF0ZSBfc2Vjb25kYXJ5VVZzRGlydHk6Ym9vbGVhbiA9IHRydWU7XG5cdHByaXZhdGUgX2pvaW50SW5kaWNlc0RpcnR5OmJvb2xlYW4gPSB0cnVlO1xuXHRwcml2YXRlIF9qb2ludFdlaWdodHNEaXJ0eTpib29sZWFuID0gdHJ1ZTtcblxuXHRwcml2YXRlIF9wb3NpdGlvbnM6QXJyYXk8bnVtYmVyPjtcblx0cHJpdmF0ZSBfY3VydmVzOkFycmF5PG51bWJlcj47XG5cdHByaXZhdGUgX3V2czpBcnJheTxudW1iZXI+O1xuXG5cblx0cHJpdmF0ZSBfdXNlQ29uZGVuc2VkSW5kaWNlczpib29sZWFuO1xuXHRwcml2YXRlIF9jb25kZW5zZWRKb2ludEluZGljZXM6QXJyYXk8bnVtYmVyPjtcblx0cHJpdmF0ZSBfY29uZGVuc2VkSW5kZXhMb29rVXA6QXJyYXk8bnVtYmVyPjtcblxuXG5cdHByaXZhdGUgX2NvbmNhdGVuYXRlQXJyYXlzOmJvb2xlYW4gPSB0cnVlO1xuXHRwcml2YXRlIF9hdXRvRGVyaXZlTm9ybWFsczpib29sZWFuID0gZmFsc2U7XG5cdHByaXZhdGUgX3VzZUZhY2VXZWlnaHRzOmJvb2xlYW4gPSBmYWxzZTtcbiAgICBwcml2YXRlIF9hdXRvRGVyaXZlVVZzOmJvb2xlYW4gPSBmYWxzZTtcblxuXHRwcml2YXRlIF9mYWNlTm9ybWFsczpBcnJheTxudW1iZXI+O1xuXHRwcml2YXRlIF9mYWNlVGFuZ2VudHM6QXJyYXk8bnVtYmVyPjtcblx0cHJpdmF0ZSBfZmFjZVdlaWdodHM6QXJyYXk8bnVtYmVyPjtcblxuXHRwcml2YXRlIF9zY2FsZVU6bnVtYmVyID0gMTtcblx0cHJpdmF0ZSBfc2NhbGVWOm51bWJlciA9IDE7XG5cblx0cHJpdmF0ZSBfcG9zaXRpb25zVXBkYXRlZDpTdWJHZW9tZXRyeUV2ZW50O1xuXHRwcml2YXRlIF9jdXJ2ZXNVcGRhdGVkOlN1Ykdlb21ldHJ5RXZlbnQ7XG5cdHByaXZhdGUgX3RhbmdlbnRzVXBkYXRlZDpTdWJHZW9tZXRyeUV2ZW50O1xuXHRwcml2YXRlIF91dnNVcGRhdGVkOlN1Ykdlb21ldHJ5RXZlbnQ7XG5cdHByaXZhdGUgX3NlY29uZGFyeVVWc1VwZGF0ZWQ6U3ViR2VvbWV0cnlFdmVudDtcblxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIGdldCBzY2FsZVUoKTpudW1iZXJcblx0e1xuXHRcdHJldHVybiB0aGlzLl9zY2FsZVU7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBnZXQgc2NhbGVWKCk6bnVtYmVyXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fc2NhbGVWO1xuXHR9XG5cblx0LyoqXG5cdCAqIE9mZmVycyB0aGUgb3B0aW9uIG9mIGVuYWJsaW5nIEdQVSBhY2NlbGVyYXRlZCBhbmltYXRpb24gb24gc2tlbGV0b25zIGxhcmdlciB0aGFuIDMyIGpvaW50c1xuXHQgKiBieSBjb25kZW5zaW5nIHRoZSBudW1iZXIgb2Ygam9pbnQgaW5kZXggdmFsdWVzIHJlcXVpcmVkIHBlciBtZXNoLiBPbmx5IGFwcGxpY2FibGUgdG9cblx0ICogc2tlbGV0b24gYW5pbWF0aW9ucyB0aGF0IHV0aWxpc2UgbW9yZSB0aGFuIG9uZSBtZXNoIG9iamVjdC4gRGVmYXVsdHMgdG8gZmFsc2UuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHVzZUNvbmRlbnNlZEluZGljZXMoKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fdXNlQ29uZGVuc2VkSW5kaWNlcztcblx0fVxuXG5cdHB1YmxpYyBzZXQgdXNlQ29uZGVuc2VkSW5kaWNlcyh2YWx1ZTpib29sZWFuKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3VzZUNvbmRlbnNlZEluZGljZXMgPT0gdmFsdWUpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl91c2VDb25kZW5zZWRJbmRpY2VzID0gdmFsdWU7XG5cdH1cblxuXHRwdWJsaWMgX3BVcGRhdGVTdHJpZGVPZmZzZXQoKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2NvbmNhdGVuYXRlQXJyYXlzKSB7XG5cdFx0XHR0aGlzLl9wT2Zmc2V0W0N1cnZlU3ViR2VvbWV0cnkuVkVSVEVYX0RBVEFdID0gMDtcblxuXHRcdFx0Ly9hbHdheXMgaGF2ZSBwb3NpdGlvbnNcblx0XHRcdHRoaXMuX3BPZmZzZXRbQ3VydmVTdWJHZW9tZXRyeS5QT1NJVElPTl9EQVRBXSA9IDA7XG5cdFx0XHR2YXIgc3RyaWRlOm51bWJlciA9IDM7XG5cblx0XHRcdGlmICh0aGlzLl9jdXJ2ZXMgIT0gbnVsbCkge1xuXHRcdFx0XHR0aGlzLl9wT2Zmc2V0W0N1cnZlU3ViR2VvbWV0cnkuQ1VSVkVfREFUQV0gPSBzdHJpZGU7XG5cdFx0XHRcdHN0cmlkZSArPSAyO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5fdXZzICE9IG51bGwpIHtcblx0XHRcdFx0dGhpcy5fcE9mZnNldFtDdXJ2ZVN1Ykdlb21ldHJ5LlVWX0RBVEFdID0gc3RyaWRlO1xuXHRcdFx0XHRzdHJpZGUgKz0gMjtcblx0XHRcdH1cblxuXG5cblx0XHRcdHRoaXMuX3BTdHJpZGVbQ3VydmVTdWJHZW9tZXRyeS5WRVJURVhfREFUQV0gPSBzdHJpZGU7XG5cdFx0XHR0aGlzLl9wU3RyaWRlW0N1cnZlU3ViR2VvbWV0cnkuUE9TSVRJT05fREFUQV0gPSBzdHJpZGU7XG5cdFx0XHR0aGlzLl9wU3RyaWRlW0N1cnZlU3ViR2VvbWV0cnkuQ1VSVkVfREFUQV0gPSBzdHJpZGU7XG5cdFx0XHR0aGlzLl9wU3RyaWRlW0N1cnZlU3ViR2VvbWV0cnkuVVZfREFUQV0gPSBzdHJpZGU7XG5cblx0XHRcdHZhciBsZW46bnVtYmVyID0gdGhpcy5fcE51bVZlcnRpY2VzKnN0cmlkZTtcblxuXHRcdFx0aWYgKHRoaXMuX3BWZXJ0aWNlcyA9PSBudWxsKVxuXHRcdFx0XHR0aGlzLl9wVmVydGljZXMgPSBuZXcgQXJyYXk8bnVtYmVyPihsZW4pO1xuXHRcdFx0ZWxzZSBpZiAodGhpcy5fcFZlcnRpY2VzLmxlbmd0aCAhPSBsZW4pXG5cdFx0XHRcdHRoaXMuX3BWZXJ0aWNlcy5sZW5ndGggPSBsZW47XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5fcE9mZnNldFtDdXJ2ZVN1Ykdlb21ldHJ5LlBPU0lUSU9OX0RBVEFdID0gMDtcblx0XHRcdHRoaXMuX3BPZmZzZXRbQ3VydmVTdWJHZW9tZXRyeS5DVVJWRV9EQVRBXSA9IDA7XG5cdFx0XHR0aGlzLl9wT2Zmc2V0W0N1cnZlU3ViR2VvbWV0cnkuVVZfREFUQV0gPSAwO1xuXG5cblx0XHRcdHRoaXMuX3BTdHJpZGVbQ3VydmVTdWJHZW9tZXRyeS5QT1NJVElPTl9EQVRBXSA9IDM7XG5cdFx0XHR0aGlzLl9wU3RyaWRlW0N1cnZlU3ViR2VvbWV0cnkuQ1VSVkVfREFUQV0gPSAyO1xuXHRcdFx0dGhpcy5fcFN0cmlkZVtDdXJ2ZVN1Ykdlb21ldHJ5LlVWX0RBVEFdID0gMjtcblx0XHR9XG5cblx0XHR0aGlzLl9wU3RyaWRlT2Zmc2V0RGlydHkgPSBmYWxzZTtcblx0fVxuXG5cblxuXHQvKipcblx0ICogRGVmaW5lcyB3aGV0aGVyIGEgVVYgYnVmZmVyIHNob3VsZCBiZSBhdXRvbWF0aWNhbGx5IGdlbmVyYXRlZCB0byBjb250YWluIGR1bW15IFVWIGNvb3JkaW5hdGVzLlxuXHQgKiBTZXQgdG8gdHJ1ZSBpZiBhIGdlb21ldHJ5IGxhY2tzIFVWIGRhdGEgYnV0IHVzZXMgYSBtYXRlcmlhbCB0aGF0IHJlcXVpcmVzIGl0LCBvciBsZWF2ZSBhcyBmYWxzZVxuXHQgKiBpbiBjYXNlcyB3aGVyZSBVViBkYXRhIGlzIGV4cGxpY2l0bHkgZGVmaW5lZCBvciB0aGUgbWF0ZXJpYWwgZG9lcyBub3QgcmVxdWlyZSBVViBkYXRhLlxuXHQgKi9cblx0cHVibGljIGdldCBhdXRvRGVyaXZlVVZzKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIGZhbHNlOy8vdGhpcy5fYXV0b0Rlcml2ZVVWcztcblx0fVxuXG5cdHB1YmxpYyBzZXQgYXV0b0Rlcml2ZVVWcyh2YWx1ZTpib29sZWFuKVxuXHR7XG5cdFx0Ly9pZiAodGhpcy5fYXV0b0Rlcml2ZVVWcyA9PSB2YWx1ZSlcblx0XHRcdHJldHVybjtcblxuXHRcdC8vdGhpcy5fYXV0b0Rlcml2ZVVWcyA9IHZhbHVlO1xuXG5cdFx0aWYgKHZhbHVlKVxuXHRcdFx0dGhpcy5ub3RpZnlVVnNVcGRhdGUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUcnVlIGlmIHRoZSB2ZXJ0ZXggbm9ybWFscyBzaG91bGQgYmUgZGVyaXZlZCBmcm9tIHRoZSBnZW9tZXRyeSwgZmFsc2UgaWYgdGhlIHZlcnRleCBub3JtYWxzIGFyZSBzZXRcblx0ICogZXhwbGljaXRseS5cblx0ICovXG5cdHB1YmxpYyBnZXQgYXV0b0Rlcml2ZU5vcm1hbHMoKTpib29sZWFuXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5fYXV0b0Rlcml2ZU5vcm1hbHM7XG5cdH1cblxuICAgIC8vcmVtb3ZlXG5cdHB1YmxpYyBzZXQgYXV0b0Rlcml2ZU5vcm1hbHModmFsdWU6Ym9vbGVhbilcblx0e1xuXHRcdGlmICh0aGlzLl9hdXRvRGVyaXZlTm9ybWFscyA9PSB2YWx1ZSlcblx0XHRcdHJldHVybjtcblxuXHRcdHRoaXMuX2F1dG9EZXJpdmVOb3JtYWxzID0gdmFsdWU7XG5cblx0fVxuXG5cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBnZXQgdmVydGljZXMoKTpBcnJheTxudW1iZXI+XG5cdHtcblx0XHRpZiAodGhpcy5fcG9zaXRpb25zRGlydHkpXG5cdFx0XHR0aGlzLnVwZGF0ZVBvc2l0aW9ucyh0aGlzLl9wb3NpdGlvbnMpO1xuXG4gICAgICAgIGlmICh0aGlzLl9jdXJ2ZXNEaXJ0eSlcbiAgICAgICAgICAgIHRoaXMudXBkYXRlQ3VydmVzKHRoaXMuX2N1cnZlcyk7XG5cblx0XHRpZiAodGhpcy5fdXZzRGlydHkpXG5cdFx0XHR0aGlzLnVwZGF0ZVVWcyh0aGlzLl91dnMpO1xuXG5cdFx0cmV0dXJuIHRoaXMuX3BWZXJ0aWNlcztcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIGdldCBwb3NpdGlvbnMoKTpBcnJheTxudW1iZXI+XG5cdHtcblx0XHRpZiAodGhpcy5fcG9zaXRpb25zRGlydHkpXG5cdFx0XHR0aGlzLnVwZGF0ZVBvc2l0aW9ucyh0aGlzLl9wb3NpdGlvbnMpO1xuXG5cdFx0cmV0dXJuIHRoaXMuX3Bvc2l0aW9ucztcblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIGdldCBjdXJ2ZXMoKTpBcnJheTxudW1iZXI+XG5cdHtcblx0XHRpZiAodGhpcy5fY3VydmVzRGlydHkpXG5cdFx0XHR0aGlzLnVwZGF0ZUN1cnZlcyh0aGlzLl9jdXJ2ZXMpO1xuXG5cdFx0cmV0dXJuIHRoaXMuX2N1cnZlcztcblx0fVxuXG5cblxuXHQvKipcblx0ICogVGhlIHJhdyBkYXRhIG9mIHRoZSBmYWNlIG5vcm1hbHMsIGluIHRoZSBzYW1lIG9yZGVyIGFzIHRoZSBmYWNlcyBhcmUgbGlzdGVkIGluIHRoZSBpbmRleCBsaXN0LlxuXHQgKi9cblx0cHVibGljIGdldCBmYWNlTm9ybWFscygpOkFycmF5PG51bWJlcj5cblx0e1xuXHRcdGlmICh0aGlzLl9mYWNlTm9ybWFsc0RpcnR5KVxuXHRcdFx0dGhpcy51cGRhdGVGYWNlTm9ybWFscygpO1xuXG5cdFx0cmV0dXJuIHRoaXMuX2ZhY2VOb3JtYWxzO1xuXHR9XG5cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyBnZXQgdXZzKCk6QXJyYXk8bnVtYmVyPlxuXHR7XG5cdFx0aWYgKHRoaXMuX3V2c0RpcnR5KVxuXHRcdFx0dGhpcy51cGRhdGVVVnModGhpcy5fdXZzKTtcblxuXHRcdHJldHVybiB0aGlzLl91dnM7XG5cdH1cblxuXG5cblxuXHQvKipcblx0ICogSW5kaWNhdGVzIHdoZXRoZXIgb3Igbm90IHRvIHRha2UgdGhlIHNpemUgb2YgZmFjZXMgaW50byBhY2NvdW50IHdoZW4gYXV0by1kZXJpdmluZyB2ZXJ0ZXggbm9ybWFscyBhbmQgdGFuZ2VudHMuXG5cdCAqL1xuXHRwdWJsaWMgZ2V0IHVzZUZhY2VXZWlnaHRzKCk6Ym9vbGVhblxuXHR7XG5cdFx0cmV0dXJuIHRoaXMuX3VzZUZhY2VXZWlnaHRzO1xuXHR9XG5cblx0cHVibGljIHNldCB1c2VGYWNlV2VpZ2h0cyh2YWx1ZTpib29sZWFuKVxuXHR7XG5cdFx0aWYgKHRoaXMuX3VzZUZhY2VXZWlnaHRzID09IHZhbHVlKVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fdXNlRmFjZVdlaWdodHMgPSB2YWx1ZTtcblxuXG5cdFx0dGhpcy5fZmFjZU5vcm1hbHNEaXJ0eSA9IHRydWU7XG5cdH1cblxuXG5cdHB1YmxpYyBnZXQgY29uZGVuc2VkSW5kZXhMb29rVXAoKTpBcnJheTxudW1iZXI+XG5cdHtcblxuXG5cdFx0cmV0dXJuIHRoaXMuX2NvbmRlbnNlZEluZGV4TG9va1VwO1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqL1xuXHRjb25zdHJ1Y3Rvcihjb25jYXRlbmF0ZWRBcnJheXM6Ym9vbGVhbilcblx0e1xuXHRcdHN1cGVyKGNvbmNhdGVuYXRlZEFycmF5cyk7XG5cblx0XHR0aGlzLl9wU3ViTWVzaENsYXNzID0gQ3VydmVTdWJNZXNoO1xuXHR9XG5cblx0cHVibGljIGdldEJvdW5kaW5nUG9zaXRpb25zKCk6QXJyYXk8bnVtYmVyPlxuXHR7XG5cdFx0aWYgKHRoaXMuX3Bvc2l0aW9uc0RpcnR5KVxuXHRcdFx0dGhpcy51cGRhdGVQb3NpdGlvbnModGhpcy5fcG9zaXRpb25zKTtcblxuXHRcdHJldHVybiB0aGlzLl9wb3NpdGlvbnM7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICovXG5cdHB1YmxpYyB1cGRhdGVQb3NpdGlvbnModmFsdWVzOkFycmF5PG51bWJlcj4pXG5cdHtcblx0XHR2YXIgaTpudW1iZXI7XG5cdFx0dmFyIGluZGV4Om51bWJlcjtcblx0XHR2YXIgc3RyaWRlOm51bWJlcjtcblx0XHR2YXIgcG9zaXRpb25zOkFycmF5PG51bWJlcj47XG5cblx0XHR0aGlzLl9wb3NpdGlvbnMgPSB2YWx1ZXM7XG5cblx0XHRpZiAodGhpcy5fcG9zaXRpb25zID09IG51bGwpXG5cdFx0XHR0aGlzLl9wb3NpdGlvbnMgPSBuZXcgQXJyYXk8bnVtYmVyPigpO1xuXG5cdFx0dGhpcy5fcE51bVZlcnRpY2VzID0gdGhpcy5fcG9zaXRpb25zLmxlbmd0aC8zO1xuXG5cdFx0aWYgKHRoaXMuX2NvbmNhdGVuYXRlQXJyYXlzKSB7XG5cdFx0XHR2YXIgbGVuOm51bWJlciA9IHRoaXMuX3BOdW1WZXJ0aWNlcyp0aGlzLmdldFN0cmlkZShDdXJ2ZVN1Ykdlb21ldHJ5LlZFUlRFWF9EQVRBKTtcblxuXHRcdFx0aWYgKHRoaXMuX3BWZXJ0aWNlcyA9PSBudWxsKVxuXHRcdFx0XHR0aGlzLl9wVmVydGljZXMgPSBuZXcgQXJyYXk8bnVtYmVyPihsZW4pO1xuXHRcdFx0ZWxzZSBpZiAodGhpcy5fcFZlcnRpY2VzLmxlbmd0aCAhPSBsZW4pXG5cdFx0XHRcdHRoaXMuX3BWZXJ0aWNlcy5sZW5ndGggPSBsZW47XG5cblx0XHRcdGkgPSAwO1xuXHRcdFx0aW5kZXggPSB0aGlzLmdldE9mZnNldChDdXJ2ZVN1Ykdlb21ldHJ5LlBPU0lUSU9OX0RBVEEpO1xuXHRcdFx0c3RyaWRlID0gdGhpcy5nZXRTdHJpZGUoQ3VydmVTdWJHZW9tZXRyeS5QT1NJVElPTl9EQVRBKTtcblx0XHRcdHBvc2l0aW9ucyA9IHRoaXMuX3BWZXJ0aWNlcztcblxuXHRcdFx0d2hpbGUgKGkgPCB2YWx1ZXMubGVuZ3RoKSB7XG5cdFx0XHRcdHBvc2l0aW9uc1tpbmRleF0gPSB2YWx1ZXNbaSsrXTtcblx0XHRcdFx0cG9zaXRpb25zW2luZGV4ICsgMV0gPSB2YWx1ZXNbaSsrXTtcblx0XHRcdFx0cG9zaXRpb25zW2luZGV4ICsgMl0gPSB2YWx1ZXNbaSsrXTtcblx0XHRcdFx0aW5kZXggKz0gc3RyaWRlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMucEludmFsaWRhdGVCb3VuZHMoKTtcblxuXHRcdHRoaXMubm90aWZ5UG9zaXRpb25zVXBkYXRlKCk7XG5cblx0XHR0aGlzLl9wb3NpdGlvbnNEaXJ0eSA9IGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgdGhlIHZlcnRleCBub3JtYWxzIGJhc2VkIG9uIHRoZSBnZW9tZXRyeS5cblx0ICovXG5cdHB1YmxpYyB1cGRhdGVDdXJ2ZXModmFsdWVzOkFycmF5PG51bWJlcj4pXG5cdHtcblx0XHR2YXIgaTpudW1iZXI7XG5cdFx0dmFyIGluZGV4Om51bWJlcjtcblx0XHR2YXIgb2Zmc2V0Om51bWJlcjtcblx0XHR2YXIgc3RyaWRlOm51bWJlcjtcblx0XHR2YXIgY3VydmVzOkFycmF5PG51bWJlcj47XG5cblx0XHRpZiAodHJ1ZSkge1xuXHRcdFx0aWYgKCh0aGlzLl9jdXJ2ZXMgPT0gbnVsbCB8fCB2YWx1ZXMgPT0gbnVsbCkgJiYgKHRoaXMuX2N1cnZlcyAhPSBudWxsIHx8IHZhbHVlcyAhPSBudWxsKSkge1xuXHRcdFx0XHRpZiAodGhpcy5fY29uY2F0ZW5hdGVBcnJheXMpXG4gICAgICAgICAgICAgICAgICAgIHRydWU7IC8vXCJkbyBub3RoaW5nXCI7XG5cdFx0XHRcdFx0Ly90aGlzLl9wTm90aWZ5Q3VydmVzVXBkYXRlKCk7XG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHR0aGlzLl9wU3RyaWRlT2Zmc2V0RGlydHkgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLl9jdXJ2ZXMgPSB2YWx1ZXM7XG5cblx0XHRcdGlmICh2YWx1ZXMgIT0gbnVsbCAmJiB0aGlzLl9jb25jYXRlbmF0ZUFycmF5cykge1xuXHRcdFx0XHRpID0gMDtcblx0XHRcdFx0aW5kZXggPSB0aGlzLmdldE9mZnNldChDdXJ2ZVN1Ykdlb21ldHJ5LkNVUlZFX0RBVEEpO1xuXHRcdFx0XHRzdHJpZGUgPSB0aGlzLmdldFN0cmlkZShDdXJ2ZVN1Ykdlb21ldHJ5LkNVUlZFX0RBVEEpO1xuICAgICAgICAgICAgICAgIGN1cnZlcyA9IHRoaXMuX3BWZXJ0aWNlcztcblxuXHRcdFx0XHR3aGlsZSAoaSA8IHZhbHVlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgY3VydmVzW2luZGV4XSA9IHZhbHVlc1tpKytdO1xuICAgICAgICAgICAgICAgICAgICBjdXJ2ZXNbaW5kZXggKyAxXSA9IHZhbHVlc1tpKytdO1xuXHRcdFx0XHRcdGluZGV4ICs9IHN0cmlkZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLm5vdGlmeUN1cnZlc1VwZGF0ZSgpO1xuXG5cdFx0dGhpcy5fY3VydmVzRGlydHkgPSBmYWxzZTtcblx0fVxuXG5cblxuXHQvKipcblx0ICogVXBkYXRlcyB0aGUgdXZzIGJhc2VkIG9uIHRoZSBnZW9tZXRyeS5cblx0ICovXG5cdHB1YmxpYyB1cGRhdGVVVnModmFsdWVzOkFycmF5PG51bWJlcj4pXG5cdHtcblx0XHR2YXIgaTpudW1iZXI7XG5cdFx0dmFyIGluZGV4Om51bWJlcjtcblx0XHR2YXIgb2Zmc2V0Om51bWJlcjtcblx0XHR2YXIgc3RyaWRlOm51bWJlcjtcblx0XHR2YXIgdXZzOkFycmF5PG51bWJlcj47XG5cblx0XHRpZiAoIXRoaXMuX2F1dG9EZXJpdmVVVnMpIHtcblx0XHRcdGlmICgodGhpcy5fdXZzID09IG51bGwgfHwgdmFsdWVzID09IG51bGwpICYmICh0aGlzLl91dnMgIT0gbnVsbCB8fCB2YWx1ZXMgIT0gbnVsbCkpIHtcblx0XHRcdFx0aWYgKHRoaXMuX2NvbmNhdGVuYXRlQXJyYXlzKVxuXHRcdFx0XHRcdHRoaXMuX3BOb3RpZnlWZXJ0aWNlc1VwZGF0ZSgpO1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0dGhpcy5fcFN0cmlkZU9mZnNldERpcnR5ID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5fdXZzID0gdmFsdWVzO1xuXG5cdFx0XHRpZiAodmFsdWVzICE9IG51bGwgJiYgdGhpcy5fY29uY2F0ZW5hdGVBcnJheXMpIHtcblx0XHRcdFx0aSA9IDA7XG5cdFx0XHRcdGluZGV4ID0gdGhpcy5nZXRPZmZzZXQoQ3VydmVTdWJHZW9tZXRyeS5VVl9EQVRBKTtcblx0XHRcdFx0c3RyaWRlID0gdGhpcy5nZXRTdHJpZGUoQ3VydmVTdWJHZW9tZXRyeS5VVl9EQVRBKTtcblx0XHRcdFx0dXZzID0gdGhpcy5fcFZlcnRpY2VzO1xuXG5cdFx0XHRcdHdoaWxlIChpIDwgdmFsdWVzLmxlbmd0aCkge1xuXHRcdFx0XHRcdHV2c1tpbmRleF0gPSB2YWx1ZXNbaSsrXTtcblx0XHRcdFx0XHR1dnNbaW5kZXggKyAxXSA9IHZhbHVlc1tpKytdO1xuXHRcdFx0XHRcdGluZGV4ICs9IHN0cmlkZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0aGlzLl91dnMgPT0gbnVsbCkge1xuXHRcdFx0XHR0aGlzLl91dnMgPSBuZXcgQXJyYXk8bnVtYmVyPih0aGlzLl9wb3NpdGlvbnMubGVuZ3RoKjIvMyk7XG5cblx0XHRcdFx0aWYgKHRoaXMuX2NvbmNhdGVuYXRlQXJyYXlzKVxuXHRcdFx0XHRcdHRoaXMuX3BOb3RpZnlWZXJ0aWNlc1VwZGF0ZSgpO1xuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0dGhpcy5fcFN0cmlkZU9mZnNldERpcnR5ID0gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0b2Zmc2V0ID0gdGhpcy5nZXRPZmZzZXQoQ3VydmVTdWJHZW9tZXRyeS5VVl9EQVRBKTtcblx0XHRcdHN0cmlkZSA9IHRoaXMuZ2V0U3RyaWRlKEN1cnZlU3ViR2VvbWV0cnkuVVZfREFUQSk7XG5cblx0XHRcdC8vYXV0b2Rlcml2ZWQgdXZzXG5cdFx0XHR1dnMgPSB0aGlzLl9jb25jYXRlbmF0ZUFycmF5cz8gdGhpcy5fcFZlcnRpY2VzIDogdGhpcy5fdXZzO1xuXG5cdFx0XHRpID0gMDtcblx0XHRcdGluZGV4ID0gb2Zmc2V0O1xuXHRcdFx0dmFyIHV2SWR4Om51bWJlciA9IDA7XG5cblx0XHRcdC8vY2xlYXIgdXYgdmFsdWVzXG5cdFx0XHR2YXIgbGVuVjpudW1iZXIgPSB1dnMubGVuZ3RoO1xuXHRcdFx0d2hpbGUgKGluZGV4IDwgbGVuVikge1xuXHRcdFx0XHRpZiAodGhpcy5fY29uY2F0ZW5hdGVBcnJheXMpIHtcblx0XHRcdFx0XHR0aGlzLl91dnNbaSsrXSA9IHV2c1tpbmRleF0gPSB1dklkeCouNTtcblx0XHRcdFx0XHR0aGlzLl91dnNbaSsrXSA9IHV2c1tpbmRleCArIDFdID0gMS4wIC0gKHV2SWR4ICYgMSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dXZzW2luZGV4XSA9IHV2SWR4Ki41O1xuXHRcdFx0XHRcdHV2c1tpbmRleCArIDFdID0gMS4wIC0gKHV2SWR4ICYgMSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoKyt1dklkeCA9PSAzKVxuXHRcdFx0XHRcdHV2SWR4ID0gMDtcblxuXHRcdFx0XHRpbmRleCArPSBzdHJpZGU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5ub3RpZnlVVnNVcGRhdGUoKTtcblxuXHRcdHRoaXMuX3V2c0RpcnR5ID0gZmFsc2U7XG5cdH1cblxuXG5cblxuXG5cdC8qKlxuXHQgKlxuXHQgKi9cblx0cHVibGljIGRpc3Bvc2UoKVxuXHR7XG5cdFx0c3VwZXIuZGlzcG9zZSgpO1xuXG5cdFx0dGhpcy5fcG9zaXRpb25zID0gbnVsbDtcblx0XHR0aGlzLl9jdXJ2ZXMgPSBudWxsO1xuXHRcdHRoaXMuX3V2cyA9IG51bGw7XG5cblx0XHR0aGlzLl9mYWNlTm9ybWFscyA9IG51bGw7XG5cdFx0dGhpcy5fZmFjZVdlaWdodHMgPSBudWxsO1xuXHRcdHRoaXMuX2ZhY2VUYW5nZW50cyA9IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogVXBkYXRlcyB0aGUgZmFjZSBpbmRpY2VzIG9mIHRoZSBDdXJ2ZVN1Ykdlb21ldHJ5LlxuXHQgKlxuXHQgKiBAcGFyYW0gaW5kaWNlcyBUaGUgZmFjZSBpbmRpY2VzIHRvIHVwbG9hZC5cblx0ICovXG5cdHB1YmxpYyB1cGRhdGVJbmRpY2VzKGluZGljZXM6QXJyYXk8bnVtYmVyPilcblx0e1xuXHRcdHN1cGVyLnVwZGF0ZUluZGljZXMoaW5kaWNlcyk7XG5cblx0XHR0aGlzLl9mYWNlTm9ybWFsc0RpcnR5ID0gdHJ1ZTtcblxuXHRcdGlmICh0aGlzLl9hdXRvRGVyaXZlTm9ybWFscylcblx0XHRcdHRoaXMuX3ZlcnRleE5vcm1hbHNEaXJ0eSA9IHRydWU7XG5cblx0fVxuXG5cdC8qKlxuXHQgKiBDbG9uZXMgdGhlIGN1cnJlbnQgb2JqZWN0XG5cdCAqIEByZXR1cm4gQW4gZXhhY3QgZHVwbGljYXRlIG9mIHRoZSBjdXJyZW50IG9iamVjdC5cblx0ICovXG5cdHB1YmxpYyBjbG9uZSgpOkN1cnZlU3ViR2VvbWV0cnlcblx0e1xuXHRcdHZhciBjbG9uZTpDdXJ2ZVN1Ykdlb21ldHJ5ID0gbmV3IEN1cnZlU3ViR2VvbWV0cnkodGhpcy5fY29uY2F0ZW5hdGVBcnJheXMpO1xuXHRcdGNsb25lLnVwZGF0ZUluZGljZXModGhpcy5fcEluZGljZXMuY29uY2F0KCkpO1xuXHRcdGNsb25lLnVwZGF0ZVBvc2l0aW9ucyh0aGlzLl9wb3NpdGlvbnMuY29uY2F0KCkpO1xuXG5cdFx0aWYgKHRoaXMuX2N1cnZlcylcblx0XHRcdGNsb25lLnVwZGF0ZUN1cnZlcyh0aGlzLl9jdXJ2ZXMuY29uY2F0KCkpO1xuXHRcdGVsc2Vcblx0XHRcdGNsb25lLnVwZGF0ZUN1cnZlcyhudWxsKTtcblxuXHRcdGlmICh0aGlzLl91dnMgJiYgIXRoaXMuX2F1dG9EZXJpdmVVVnMpXG5cdFx0XHRjbG9uZS51cGRhdGVVVnModGhpcy5fdXZzLmNvbmNhdCgpKTtcblx0XHRlbHNlXG5cdFx0XHRjbG9uZS51cGRhdGVVVnMobnVsbCk7XG5cblx0XHRyZXR1cm4gY2xvbmU7XG5cdH1cblxuXHRwdWJsaWMgc2NhbGVVVihzY2FsZVU6bnVtYmVyID0gMSwgc2NhbGVWOm51bWJlciA9IDEpXG5cdHtcblx0XHR2YXIgaW5kZXg6bnVtYmVyO1xuXHRcdHZhciBvZmZzZXQ6bnVtYmVyO1xuXHRcdHZhciBzdHJpZGU6bnVtYmVyO1xuXHRcdHZhciB1dnM6QXJyYXk8bnVtYmVyPjtcblxuXHRcdHV2cyA9IHRoaXMuX3V2cztcblxuXHRcdHZhciByYXRpb1U6bnVtYmVyID0gc2NhbGVVL3RoaXMuX3NjYWxlVTtcblx0XHR2YXIgcmF0aW9WOm51bWJlciA9IHNjYWxlVi90aGlzLl9zY2FsZVY7XG5cblx0XHR0aGlzLl9zY2FsZVUgPSBzY2FsZVU7XG5cdFx0dGhpcy5fc2NhbGVWID0gc2NhbGVWO1xuXG5cdFx0dmFyIGxlbjpudW1iZXIgPSB1dnMubGVuZ3RoO1xuXG5cdFx0b2Zmc2V0ID0gMDtcblx0XHRzdHJpZGUgPSAyO1xuXG5cdFx0aW5kZXggPSBvZmZzZXQ7XG5cblx0XHR3aGlsZSAoaW5kZXggPCBsZW4pIHtcblx0XHRcdHV2c1tpbmRleF0gKj0gcmF0aW9VO1xuXHRcdFx0dXZzW2luZGV4ICsgMV0gKj0gcmF0aW9WO1xuXHRcdFx0aW5kZXggKz0gc3RyaWRlO1xuXHRcdH1cblxuXHRcdHRoaXMubm90aWZ5VVZzVXBkYXRlKCk7XG5cdH1cblxuXHQvKipcblx0ICogU2NhbGVzIHRoZSBnZW9tZXRyeS5cblx0ICogQHBhcmFtIHNjYWxlIFRoZSBhbW91bnQgYnkgd2hpY2ggdG8gc2NhbGUuXG5cdCAqL1xuXHRwdWJsaWMgc2NhbGUoc2NhbGU6bnVtYmVyKVxuXHR7XG5cdFx0dmFyIGk6bnVtYmVyO1xuXHRcdHZhciBpbmRleDpudW1iZXI7XG5cdFx0dmFyIG9mZnNldDpudW1iZXI7XG5cdFx0dmFyIHN0cmlkZTpudW1iZXI7XG5cdFx0dmFyIHBvc2l0aW9uczpBcnJheTxudW1iZXI+O1xuXG5cdFx0cG9zaXRpb25zID0gdGhpcy5fcG9zaXRpb25zO1xuXG5cdFx0dmFyIGxlbjpudW1iZXIgPSBwb3NpdGlvbnMubGVuZ3RoO1xuXG5cdFx0b2Zmc2V0ID0gMDtcblx0XHRzdHJpZGUgPSAzO1xuXG5cdFx0aSA9IDA7XG5cdFx0aW5kZXggPSBvZmZzZXQ7XG5cdFx0d2hpbGUgKGkgPCBsZW4pIHtcblx0XHRcdHBvc2l0aW9uc1tpbmRleF0gKj0gc2NhbGU7XG5cdFx0XHRwb3NpdGlvbnNbaW5kZXggKyAxXSAqPSBzY2FsZTtcblx0XHRcdHBvc2l0aW9uc1tpbmRleCArIDJdICo9IHNjYWxlO1xuXG5cdFx0XHRpICs9IDM7XG5cdFx0XHRpbmRleCArPSBzdHJpZGU7XG5cdFx0fVxuXG5cdFx0dGhpcy5ub3RpZnlQb3NpdGlvbnNVcGRhdGUoKTtcblx0fVxuXG5cdHB1YmxpYyBhcHBseVRyYW5zZm9ybWF0aW9uKHRyYW5zZm9ybTpNYXRyaXgzRClcblx0e1xuXHRcdHZhciBwb3NpdGlvbnM6QXJyYXk8bnVtYmVyPjtcblxuXHRcdGlmICh0aGlzLl9jb25jYXRlbmF0ZUFycmF5cykge1xuXHRcdFx0cG9zaXRpb25zID0gdGhpcy5fcFZlcnRpY2VzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwb3NpdGlvbnMgPSB0aGlzLl9wb3NpdGlvbnM7XG5cdFx0fVxuXG5cdFx0dmFyIGxlbjpudW1iZXIgPSB0aGlzLl9wb3NpdGlvbnMubGVuZ3RoLzM7XG5cdFx0dmFyIGk6bnVtYmVyO1xuXHRcdHZhciBpMTpudW1iZXI7XG5cdFx0dmFyIGkyOm51bWJlcjtcblx0XHR2YXIgdmVjdG9yOlZlY3RvcjNEID0gbmV3IFZlY3RvcjNEKCk7XG5cblx0XHR2YXIgaW52VHJhbnNwb3NlOk1hdHJpeDNEO1xuXG5cblxuXHRcdHZhciB2aTA6bnVtYmVyID0gdGhpcy5nZXRPZmZzZXQoQ3VydmVTdWJHZW9tZXRyeS5QT1NJVElPTl9EQVRBKTtcblx0XHR2YXIgdlN0cmlkZTpudW1iZXIgPSB0aGlzLmdldFN0cmlkZShDdXJ2ZVN1Ykdlb21ldHJ5LlBPU0lUSU9OX0RBVEEpO1xuXG5cdFx0Zm9yIChpID0gMDsgaSA8IGxlbjsgKytpKSB7XG5cdFx0XHRpMSA9IHZpMCArIDE7XG5cdFx0XHRpMiA9IHZpMCArIDI7XG5cblx0XHRcdC8vIGJha2UgcG9zaXRpb25cblx0XHRcdHZlY3Rvci54ID0gcG9zaXRpb25zW3ZpMF07XG5cdFx0XHR2ZWN0b3IueSA9IHBvc2l0aW9uc1tpMV07XG5cdFx0XHR2ZWN0b3IueiA9IHBvc2l0aW9uc1tpMl07XG5cdFx0XHR2ZWN0b3IgPSB0cmFuc2Zvcm0udHJhbnNmb3JtVmVjdG9yKHZlY3Rvcik7XG5cdFx0XHRwb3NpdGlvbnNbdmkwXSA9IHZlY3Rvci54O1xuXHRcdFx0cG9zaXRpb25zW2kxXSA9IHZlY3Rvci55O1xuXHRcdFx0cG9zaXRpb25zW2kyXSA9IHZlY3Rvci56O1xuXHRcdFx0dmkwICs9IHZTdHJpZGU7XG5cblx0XHR9XG5cblx0XHR0aGlzLm5vdGlmeVBvc2l0aW9uc1VwZGF0ZSgpO1xuXHR9XG5cblxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBub3JtYWxzIGZvciBlYWNoIGZhY2UuXG5cdCAqL1xuXHRwcml2YXRlIHVwZGF0ZUZhY2VOb3JtYWxzKClcblx0e1xuXHRcdHZhciBpOm51bWJlciA9IDA7XG5cdFx0dmFyIGo6bnVtYmVyID0gMDtcblx0XHR2YXIgazpudW1iZXIgPSAwO1xuXHRcdHZhciBpbmRleDpudW1iZXI7XG5cdFx0dmFyIG9mZnNldDpudW1iZXI7XG5cdFx0dmFyIHN0cmlkZTpudW1iZXI7XG5cblx0XHR2YXIgeDE6bnVtYmVyLCB4MjpudW1iZXIsIHgzOm51bWJlcjtcblx0XHR2YXIgeTE6bnVtYmVyLCB5MjpudW1iZXIsIHkzOm51bWJlcjtcblx0XHR2YXIgejE6bnVtYmVyLCB6MjpudW1iZXIsIHozOm51bWJlcjtcblx0XHR2YXIgZHgxOm51bWJlciwgZHkxOm51bWJlciwgZHoxOm51bWJlcjtcblx0XHR2YXIgZHgyOm51bWJlciwgZHkyOm51bWJlciwgZHoyOm51bWJlcjtcblx0XHR2YXIgY3g6bnVtYmVyLCBjeTpudW1iZXIsIGN6Om51bWJlcjtcblx0XHR2YXIgZDpudW1iZXI7XG5cblx0XHR2YXIgcG9zaXRpb25zOkFycmF5PG51bWJlcj4gPSB0aGlzLl9wb3NpdGlvbnM7XG5cblx0XHR2YXIgbGVuOm51bWJlciA9IHRoaXMuX3BJbmRpY2VzLmxlbmd0aDtcblxuXHRcdGlmICh0aGlzLl9mYWNlTm9ybWFscyA9PSBudWxsKVxuXHRcdFx0dGhpcy5fZmFjZU5vcm1hbHMgPSBuZXcgQXJyYXk8bnVtYmVyPihsZW4pO1xuXG5cdFx0aWYgKHRoaXMuX3VzZUZhY2VXZWlnaHRzICYmIHRoaXMuX2ZhY2VXZWlnaHRzID09IG51bGwpXG5cdFx0XHR0aGlzLl9mYWNlV2VpZ2h0cyA9IG5ldyBBcnJheTxudW1iZXI+KGxlbi8zKTtcblxuXHRcdHdoaWxlIChpIDwgbGVuKSB7XG5cdFx0XHRpbmRleCA9IHRoaXMuX3BJbmRpY2VzW2krK10qMztcblx0XHRcdHgxID0gcG9zaXRpb25zW2luZGV4XTtcblx0XHRcdHkxID0gcG9zaXRpb25zW2luZGV4ICsgMV07XG5cdFx0XHR6MSA9IHBvc2l0aW9uc1tpbmRleCArIDJdO1xuXHRcdFx0aW5kZXggPSB0aGlzLl9wSW5kaWNlc1tpKytdKjM7XG5cdFx0XHR4MiA9IHBvc2l0aW9uc1tpbmRleF07XG5cdFx0XHR5MiA9IHBvc2l0aW9uc1tpbmRleCArIDFdO1xuXHRcdFx0ejIgPSBwb3NpdGlvbnNbaW5kZXggKyAyXTtcblx0XHRcdGluZGV4ID0gdGhpcy5fcEluZGljZXNbaSsrXSozO1xuXHRcdFx0eDMgPSBwb3NpdGlvbnNbaW5kZXhdO1xuXHRcdFx0eTMgPSBwb3NpdGlvbnNbaW5kZXggKyAxXTtcblx0XHRcdHozID0gcG9zaXRpb25zW2luZGV4ICsgMl07XG5cdFx0XHRkeDEgPSB4MyAtIHgxO1xuXHRcdFx0ZHkxID0geTMgLSB5MTtcblx0XHRcdGR6MSA9IHozIC0gejE7XG5cdFx0XHRkeDIgPSB4MiAtIHgxO1xuXHRcdFx0ZHkyID0geTIgLSB5MTtcblx0XHRcdGR6MiA9IHoyIC0gejE7XG5cdFx0XHRjeCA9IGR6MSpkeTIgLSBkeTEqZHoyO1xuXHRcdFx0Y3kgPSBkeDEqZHoyIC0gZHoxKmR4Mjtcblx0XHRcdGN6ID0gZHkxKmR4MiAtIGR4MSpkeTI7XG5cdFx0XHRkID0gTWF0aC5zcXJ0KGN4KmN4ICsgY3kqY3kgKyBjeipjeik7XG5cdFx0XHQvLyBsZW5ndGggb2YgY3Jvc3MgcHJvZHVjdCA9IDIqdHJpYW5nbGUgYXJlYVxuXG5cdFx0XHRpZiAodGhpcy5fdXNlRmFjZVdlaWdodHMpIHtcblx0XHRcdFx0dmFyIHc6bnVtYmVyID0gZCoxMDAwMDtcblxuXHRcdFx0XHRpZiAodyA8IDEpXG5cdFx0XHRcdFx0dyA9IDE7XG5cblx0XHRcdFx0dGhpcy5fZmFjZVdlaWdodHNbaysrXSA9IHc7XG5cdFx0XHR9XG5cblx0XHRcdGQgPSAxL2Q7XG5cblx0XHRcdHRoaXMuX2ZhY2VOb3JtYWxzW2orK10gPSBjeCpkO1xuXHRcdFx0dGhpcy5fZmFjZU5vcm1hbHNbaisrXSA9IGN5KmQ7XG5cdFx0XHR0aGlzLl9mYWNlTm9ybWFsc1tqKytdID0gY3oqZDtcblx0XHR9XG5cblx0XHR0aGlzLl9mYWNlTm9ybWFsc0RpcnR5ID0gZmFsc2U7XG5cdH1cblxuXHRwdWJsaWMgX3BOb3RpZnlWZXJ0aWNlc1VwZGF0ZSgpXG5cdHtcblx0XHR0aGlzLl9wU3RyaWRlT2Zmc2V0RGlydHkgPSB0cnVlO1xuXG5cdFx0dGhpcy5ub3RpZnlQb3NpdGlvbnNVcGRhdGUoKTtcblx0XHR0aGlzLm5vdGlmeUN1cnZlc1VwZGF0ZSgpO1xuXHRcdHRoaXMubm90aWZ5VVZzVXBkYXRlKCk7XG5cdH1cblxuXHRwcml2YXRlIG5vdGlmeVBvc2l0aW9uc1VwZGF0ZSgpXG5cdHtcblx0XHRpZiAodGhpcy5fcG9zaXRpb25zRGlydHkpXG5cdFx0XHRyZXR1cm47XG5cblx0XHR0aGlzLl9wb3NpdGlvbnNEaXJ0eSA9IHRydWU7XG5cblx0XHRpZiAoIXRoaXMuX3Bvc2l0aW9uc1VwZGF0ZWQpXG5cdFx0XHR0aGlzLl9wb3NpdGlvbnNVcGRhdGVkID0gbmV3IFN1Ykdlb21ldHJ5RXZlbnQoU3ViR2VvbWV0cnlFdmVudC5WRVJUSUNFU19VUERBVEVELCBDdXJ2ZVN1Ykdlb21ldHJ5LlBPU0lUSU9OX0RBVEEpO1xuXG5cdFx0dGhpcy5kaXNwYXRjaEV2ZW50KHRoaXMuX3Bvc2l0aW9uc1VwZGF0ZWQpO1xuXHR9XG5cblx0cHJpdmF0ZSBub3RpZnlDdXJ2ZXNVcGRhdGUoKVxuXHR7XG5cdFx0aWYgKHRoaXMuX2N1cnZlc0RpcnR5KVxuXHRcdFx0cmV0dXJuO1xuXG5cdFx0dGhpcy5fY3VydmVzRGlydHkgPSB0cnVlO1xuXG5cdFx0aWYgKCF0aGlzLl9jdXJ2ZXNVcGRhdGVkKVxuXHRcdFx0dGhpcy5fY3VydmVzVXBkYXRlZCA9IG5ldyBTdWJHZW9tZXRyeUV2ZW50KFN1Ykdlb21ldHJ5RXZlbnQuVkVSVElDRVNfVVBEQVRFRCwgQ3VydmVTdWJHZW9tZXRyeS5DVVJWRV9EQVRBKTtcblxuXHRcdHRoaXMuZGlzcGF0Y2hFdmVudCh0aGlzLl9jdXJ2ZXNVcGRhdGVkKTtcblx0fVxuXG5cblxuXHRwcml2YXRlIG5vdGlmeVVWc1VwZGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuX3V2c0RpcnR5KVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIHRoaXMuX3V2c0RpcnR5ID0gdHJ1ZTtcblxuICAgICAgICBpZiAoIXRoaXMuX3V2c1VwZGF0ZWQpXG4gICAgICAgICAgICB0aGlzLl91dnNVcGRhdGVkID0gbmV3IFN1Ykdlb21ldHJ5RXZlbnQoU3ViR2VvbWV0cnlFdmVudC5WRVJUSUNFU19VUERBVEVELCBDdXJ2ZVN1Ykdlb21ldHJ5LlVWX0RBVEEpO1xuXG4gICAgICAgIHRoaXMuZGlzcGF0Y2hFdmVudCh0aGlzLl91dnNVcGRhdGVkKTtcbiAgICB9XG59XG5cbmV4cG9ydCA9IEN1cnZlU3ViR2VvbWV0cnk7Il19