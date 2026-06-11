import {k8sCoreV1Api} from './config.js';

export async function createService(sandboxId){
    const serviceManifest = {
        metadata: {
            name:`sandbox-service-${sandboxId}`,
            labels:{
                app:`sandbox-${sandboxId}`,
                sandboxId: sandboxId
            }
        },
        spec:{
            selector:{
                sandboxId: sandboxId
            },
            ports:[
                {
                    name:"http",
                    port: 80,
                    targetPort: 5173,
                    protocol:"TCP"
                    
                },
                {
                    name:"agent-http",
                    port: 3000,
                    targetPort: 3000,
                    protocol:"TCP"
                }
            ],
            type: "ClusterIP",
            
        }
    }

    const response = await k8sCoreV1Api.createNamespacedService({namespace:'default', body:serviceManifest});
    return response;
}


 export const deleteService = async (serviceName) => {
  try {
    const response = await k8sCoreV1Api.deleteNamespacedService({
      name: serviceName,
      namespace: "default",
    });

    console.log(`Service deleted: ${serviceName}`);
    return response;
  } catch (error) {
    if (error.code === 404) {
      console.log(`Service already deleted/not found: ${serviceName}`);
      return null;
    }

    console.error(`Failed to delete service ${serviceName}:`, error);
    throw error;
  }
};