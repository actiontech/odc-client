const CHARACTER = ':';

export const getDMSProjectNameByDatasourceName = (datasourceName: string) => {
  const [projectName] = datasourceName.split(CHARACTER) ?? [];
  if (!projectName) {
    // eslint-disable-next-line no-console
    console.warn('get project name fail by datasourceName', datasourceName);
    return null;
  }
  return projectName;
};
