/**
@module ember
@submodule ember-templates
*/

import Ember from 'ember-metal/core';
import merge from 'ember-metal/merge';
import { symbol } from 'ember-metal/utils';
import ProxyStream from 'ember-metal/streams/proxy-stream';
import { isStream } from 'ember-metal/streams/utils';
import Stream from 'ember-metal/streams/stream';
import { MUTABLE_CELL } from 'ember-views/compat/attrs-proxy';
import { INVOKE, ACTION } from 'ember-routing-htmlbars/keywords/closure-action';

export let MUTABLE_REFERENCE = symbol('MUTABLE_REFERENCE');

/**
  The `mut` helper lets you __clearly specify__ that a child `Component` can update the
  (mutable) value passed to it, which will __change the value of the parent component__.

  This is very helpful for passing mutable values to a `Component` of any size, but
  critical to understanding the logic of a large/complex `Component`.

  To specify that a parameter is mutable, when invoking the child `Component`:

  ```handlebars
  <my-child child-click-count={{mut totalClicks}} />
  ```

  The child `Component` can then modify the parent's value as needed:

  ```javascript
  // my-child.js
  export default Component.extend({
    click: function() {
      this.attrs.childClickCount.update(this.attrs.childClickCount.value + 1);
    }
  });
  ```

  See a [2.0 blog post](http://emberjs.com/blog/2015/05/10/run-up-to-two-oh.html#toc_the-code-mut-code-helper) for
  additional information on using `{{mut}}`.

  @public
  @method mut
  @param {Object} [attr] the "two-way" attribute that can be modified.
  @for Ember.Templates.helpers
  @public
*/
export default function mut(morph, env, scope, originalParams, hash, template, inverse) {
  // If `morph` is `null` the keyword is being invoked as a subexpression.
  if (morph === null) {
    var valueStream = originalParams[0];
    return mutParam(env.hooks.getValue, valueStream);
  }

  return true;
}

export function privateMut(morph, env, scope, originalParams, hash, template, inverse) {
  // If `morph` is `null` the keyword is being invoked as a subexpression.
  if (morph === null) {
    var valueStream = originalParams[0];
    return mutParam(env.hooks.getValue, valueStream, true);
  }

  return true;
}

function mutParam(read, stream, internal) {
  if (internal) {
    if (!isStream(stream)) {
      let literal = stream;
      stream = new Stream(function() { return literal; }, `(literal ${literal})`);
      stream.setValue = function(newValue) {
        literal = newValue;
        stream.notify();
      };
    }
  } else {
    Ember.assert('You can only pass a path to mut', isStream(stream));
  }

  if (stream[MUTABLE_REFERENCE]) {
    return stream;
  }

  return new MutStream(stream);
}

function MutStream(stream) {
  this.init(`(mut ${stream.label})`);
  this.path = stream.path;
  this.sourceDep = this.addMutableDependency(stream);
  this[MUTABLE_REFERENCE] = true;
}

MutStream.prototype = Object.create(ProxyStream.prototype);

merge(MutStream.prototype, {
  cell() {
    let source = this;
    let value = source.value();

    if (value && value[ACTION]) {
      return value;
    }

    let val = {
      value,
      update(val) {
        source.setValue(val);
      }
    };

    val[MUTABLE_CELL] = true;
    return val;
  },
  [INVOKE](val) {
    this.setValue(val);
  }
});
