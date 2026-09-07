const createDefaultRoles = async () => {
  try {
    console.log('>>> Roles por defecto creados (simulación)');
  } catch (error) {
    console.error('Error creando los roles por defecto', error);
  }
};

module.exports = {
  createDefaultRoles
};
