export default class NestedResolver {
  constructor(resolvers) {
    this.resolvers = resolvers.slice().reverse();
  }

  resolveRule(pkg, ruleName) {
    for (const resolver of this.resolvers) {
      try {
        return resolver.resolveRule(pkg, ruleName);
      } catch (err) {

        // ignore
      }
    }

    throw new Error(`unknown rule <${ pkg }/${ ruleName }>`);
  }

  resolveConfig(pkg, configName) {
    for (const resolver of this.resolvers) {
      try {
        return resolver.resolveConfig(pkg, configName);
      } catch (err) {

        // ignore
      }
    }

    throw new Error(`unknown config <${ pkg }/${ configName }>`);
  }
}
