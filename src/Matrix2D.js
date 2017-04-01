/**
 * Created by Merlin on 16/9/2.
 */

/* eslint-disable */
class Matrix2D {

    /**
     *
     *  a-c-tx
     *  b-d-ty
     *  0-0-1
     *
     *  a (m11) Horizontal scaling.
     *  b (m12) Horizontal skewing.
     *  c (m21) Vertical skewing.
     *  d (m22) Vertical scaling.
     *  tx (tx) Horizontal moving.
     *  ty (ty) Vertical moving.
     */
    constructor (a, b, c, d, tx, ty) {
        this.a = +a
        this.b = +b
        this.c = +c
        this.d = +d
        this.tx = +tx
        this.ty = +ty
    }

    extract (wrapper) {
        if (wrapper == null) {
            wrapper = {};
        }

        wrapper.x = this.tx;
        wrapper.y = this.ty;
        wrapper.scaleX = Math.sqrt(this.a * this.a + this.b * this.b);
        wrapper.scaleY = Math.sqrt(this.c * this.c + this.d * this.d);

        var skewX = Math.atan2(-this.c, this.d);
        var skewY = Math.atan2(this.b, this.a);

        var delta = Math.abs(1 - skewX / skewY);
        if (delta < 0.00001) { // effectively identical, can use rotation:
            wrapper.rotation = skewY / Matrix2D.DEG_TO_RAD;
            if (this.a < 0 && this.d >= 0) {
                wrapper.rotation += (wrapper.rotation <= 0) ? 180 : -180;
            }
            wrapper.skewX = wrapper.skewY = 0;
        } else {
            wrapper.skewX = skewX / Matrix2D.DEG_TO_RAD;
            wrapper.skewY = skewY / Matrix2D.DEG_TO_RAD;
            wrapper.rotation = 0
        }

        return wrapper;
    }

    append (a, b, c, d, tx, ty) {
        var a1 = this.a
        var b1 = this.b
        var c1 = this.c
        var d1 = this.d
        if (a != 1 || b != 0 || c != 0 || d != 1) {
            this.a = a1 * a + c1 * b
            this.b = b1 * a + d1 * b
            this.c = a1 * c + c1 * d
            this.d = b1 * c + d1 * d
        }
        this.tx = a1 * tx + c1 * ty + this.tx
        this.ty = b1 * tx + d1 * ty + this.ty
        return this;
    }

    applyWrapper (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
        this.tx = this.ty = 0
        this.a = this.d = 1
        this.b = this.c = 0

        if (rotation % 360) {
            var r = rotation*Matrix2D.DEG_TO_RAD;
            var cos = Math.cos(r);
            var sin = Math.sin(r);
        } else {
            cos = 1;
            sin = 0;
        }

        if (skewX || skewY) {
            // TODO: can this be combined into a single append operation?
            skewX *= Matrix2D.DEG_TO_RAD;
            skewY *= Matrix2D.DEG_TO_RAD;
            this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
            this.append(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, 0, 0);
        } else {
            this.append(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, x, y);
        }

        if (regX || regY) {
            // append the registration offset:
            this.tx -= regX*this.a+regY*this.c;
            this.ty -= regX*this.b+regY*this.d;
        }
        return this;
    }

    reset () {

    }

    toString () {
        return `matrix(${this.a}, ${this.b}, ${this.c}, ${this.d}, ${this.tx}, ${this.ty})`
    }
}

Matrix2D.DEG_TO_RAD = Math.PI / 180

export default Matrix2D
