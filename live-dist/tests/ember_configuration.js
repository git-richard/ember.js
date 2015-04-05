/*globals ENV QUnit EmberDev */

(function() {
  window.Ember = {
    testing: true
  };
  window.ENV = window.ENV || {};
  ENV.FEATURES = {"query-params-new":null,"ember-routing-named-substates":null,"ember-handlebars-caps-lookup":null,"ember-routing-drop-deprecated-action-style":null,"ember-routing-add-model-option":true,"ember-routing-linkto-target-attribute":null,"ember-routing-will-change-hooks":null,"ember-routing-consistent-resources":null};

  // Test for "hooks in ENV.EMBER_LOAD_HOOKS['hookName'] get executed"
  ENV.EMBER_LOAD_HOOKS = ENV.EMBER_LOAD_HOOKS || {};
  ENV.EMBER_LOAD_HOOKS.__before_ember_test_hook__ = ENV.EMBER_LOAD_HOOKS.__before_ember_test_hook__ || [];
  ENV.__test_hook_count__ = 0;
  ENV.EMBER_LOAD_HOOKS.__before_ember_test_hook__.push(function(object) {
    ENV.__test_hook_count__ += object;
  });

  // Handle extending prototypes
  ENV['EXTEND_PROTOTYPES'] = !!QUnit.urlParams.extendprototypes;

  // Handle testing feature flags
  ENV['ENABLE_OPTIONAL_FEATURES'] = !!QUnit.urlParams.enableoptionalfeatures;

  // Don't worry about jQuery version
  ENV['FORCE_JQUERY'] = true;

  if (EmberDev.jsHint) {
    // jsHint makes its own Object.create stub, we don't want to use this
    ENV['STUB_OBJECT_CREATE'] = !Object.create;
  }
})();
