/**
 * MODULE - $
 *
 * @description Selector(like JQuery)
 * @author Arnold.Zhang
 * @note Tanner.Sun
 */

 //简易的类Zepto实现

module.exports = function(_) {

  var 
          OBJ = {},
          ARRAY = [],
          STRING = '',
          w = window,
          doc = document,
          //建议如此 STRING = String.prototype 略微减少原型链的查找过程。
          spaceREG = /\s+/g,
          $split = STRING.split,
          $concat = ARRAY.concat,
          //返回对象自身所有可枚举属性组成的数组（不包含原型链上的属性）;
          //自身所有属性，包含不可枚举的用Object.getOwnPropertyNames()
          $keys = Object.keys;

    function Query (selector) {
        if (typeof selector == 'object') {
            this.els = $.isArrayLike(selector) ? $.toArray(selector) : [selector];
            this.exist = !!this.els.length;
            return;
        }
        //与Zepto不同的是，所有DOM collection存放在构造函数的els属性中。
        this.els = $.toArray(doc.querySelectorAll(selector));
        this.context = doc;
        this.exist = !!this.els.length;
    };

    Query.prototype = {
        constructor : Query,
        // DOM.value读取和修改DOM节点内存中的值
        // DOM.getAttribute或setAttribute 修改或读取dom属性。但是不能读取内存中的值。
        // input标签可以反映出差异。
        val : function val (value) {
            // 无法处理null的情况。_.isVoid0函数用==。此时_.isVoid0(null)为true，变为取值了。
            if (_.isVoid0(value)) {
                return this.els[0] ? this.els[0].value : '';
            }
            // 是否是this.els 否因为$.each被重写了。
            this.each(function (el) {
                el.value = value;
            });
            // 链式调用均通过return this实现。
            return this;
        },

        remove : function remove () {
            // 是否是this.els 否因为$.each被重写了。
            this.each(function (el) {
                _.remove(el);
            });
            return this;
        },
        // each 无法停止
        each : function each (callback) {
            if (_.isFunction(callback)) {
                this.els.length && this.els.forEach(function (el, i, arr) {
                    // if(callback.call(el,i,arr)==true) return this;
                    callback(el, i, arr);
                });    
            }
            return this;
        },

        html : function _html (html) {
            if (_.isVoid0(html)) {
                return this.els[0].innerHTML;
            }
            // 是否是this.els？否因为$.each被重写了。
            this.each(function (el) {
                el.innerHTML = html;
            });
            return this;
        },
        //contains只判断this.els[0]
        contains : function contains (node) {
          if (!$.isNode(node)) {
            return this;
          }
          return this.els[0].contains(node);
        },
        // 0/1 in arguments判断有几个形参
        // getAttribute以及setAttribute相互对应
        attr : function attr (key, value) {
          if (!(1 in arguments)) {
            return this.els[0].getAttribute(key);
          }
          this.each(function (el, i) {
            el.setAttribute(key, value);
          });
          return this;
        },

        append : function append (child) {
            var frag = doc.createElement('div'), children;
            if (!$.isNode(child) && !child.length) {
              return this;
            }

            if (typeof child != 'string') {
                children = $.toArray(child);
            } else {
                frag.innerHTML = child;
                children = $.toArray(frag.childNodes);
            }

            this.each(function(el, index) {
              children.forEach(function(child) {
                el.appendChild(child);
              });
            });
            return this;
        },

        css : function css (cssHtml, value) {
            var _this = this;
            if (typeof cssHtml == 'object') {
                $keys(cssHtml).forEach(function (cssName) {
                    _this.each(function (el) {
                        el.style[cssName] = cssHtml[cssName];
                    });
                });
            } else if (typeof cssHtml == 'string' && !_.isVoid0(value)){
                this.each(function (el) {
                    el.style[cssHtml] = value;
                });
            } else {
                return getComputedStyle(this.els[0], null).getPropertyValue(cssHtml);
            }
            return this;
        },

        show : function show () {
            this.each(function (el) {
                el.style.display = 'block';
            });
        },

        hide : function hide () {
            this.each(function (el) {
                el.style.display = 'none';
            });
        },

        toggle : function toggle () {
            this.each(function (el) {
                var dis = el.style.display;
                el.style.display = dis =='block' ? 'none' : 'block';
            });
        },

        on : function on (evtType, callback, useCapture) {
            this.each(function (el) {
                el.addEventListener(evtType, callback, useCapture || false);
            });
            return this;
        },
        //classList这个API用于动态新增DOM的类属性。有兼容性问题。但用于移动端，问题不大。
        //支持add(a,b,b) 不支持add([a,b,c])(会有问题，虽然不报错)
        //addClass removeClass hasClass均通过classList来实现
        addClass : function addClass (className) {
            var classArr = $split.call(className, spaceREG);
            this.each(function (el) {

                classArr.forEach(function (cls) {
                    el.classList.add(cls);
                });
            });
            return this;
        },

        removeClass : function removeClass (className) {
            var classArr = $split.call(className, spaceREG);
            this.each(function (el) {
                classArr.forEach(function (cls) {
                    el.classList.remove(cls);
                });
            });
            return this;
        },
        // hasClass只分析els[0]的classList 并不分析所有的
        // zepto和jQuery等库一般是校验所有选中的dom节点。
        hasClass : function hasClass (className) {
            //如此 return this.each(function(el){el.classList.contains(className)})
            return this.els[0].classList.contains(className);
        },

        find : function find (selector) {
            var elArr = [];
            if (typeof selector == 'string') {
                this.each(function(el) {
                    elArr = $concat.apply(elArr, el.querySelectorAll(selector));
                });
                return elArr;
            }
            return this;
        },

        eq : function (index) {
          return this.els[index] || false;
        },

        first : function () {
          return this.eq(0);
        },

        last : function () {
          return this.eq(this.els.length - 1);
        },
        // this.els第一个元素的children
        children : function () {
          return $.toArray(this.eq(0).children);
        },
        // this.els第一个元素滚入视图页面
        scrollIntoView : function () {
            this.els[0].scrollIntoView();
            return
        }

    };

    function $ (selector) {
        if ($.isUndefined(selector)) {
          return $.warn('Query need a selector');
        }

        if (typeof selector == 'function') {
            return doc.addEventListener('DOMContentLoaded', function () {
              selector(w, doc);
            }, false);
        }
        return new Query(selector);
    };

    //FIXME $ need to be a global variable?
    w.$ = w.$ || $;
    _.extend($, _);
    return $;

};
