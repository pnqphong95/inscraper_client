const MODEL_STATE = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
}
Object.freeze(MODEL_STATE);

class ModelRepository {

  static instance() {
    return Configurer.initInstance('ModelRepository', () => new ModelRepository());
  }
  
  constructor() {
    this.Sheet = Configurer.openContainerFile(); 
    Tamotsu.initialize(this.Sheet);
    this.Model = Tamotsu.Table.define({ idColumn: 'Username', sheetName: 'Model', rowShift: 1 });
  }

  updateModel(model) {
    model['Last Updated'] = new Date().toISOString();
    model.save();
  }

  getActiveModels(amount) {
    const result = this.Model.where({ State: MODEL_STATE.ACTIVE })
      .order(ModelRepository.lastUpdatedComparator).all();
    return amount ? result.slice(0, amount) : result;
  }

  getNewModels(amount) {
    const result = this.Model.where({ State: MODEL_STATE.ACTIVE })
      .where({ 'Metadata ID': '' })
      .order(ModelRepository.lastUpdatedComparator).all();
    return amount ? result.slice(0, amount) : result;
  }

  static lastUpdatedComparator(modelOne, modelTwo) {
    if (!modelOne['Last Updated'] && modelTwo['Last Updated']) return -1;
    if (modelOne['Last Updated'] && !modelTwo['Last Updated']) return 1;
    if (!modelOne['Last Updated'] && !modelTwo['Last Updated']) return 0;
    const lastUpdatedModelOne = new Date(modelOne['Last Updated']);
    const lastUpdatedModelTwo = new Date(modelTwo['Last Updated']);
    if (lastUpdatedModelOne < lastUpdatedModelTwo) return -1;
    if (lastUpdatedModelOne > lastUpdatedModelTwo) return 1;
    return 0;
  }

}