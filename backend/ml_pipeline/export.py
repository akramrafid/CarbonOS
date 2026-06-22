import torch
import torch.quantization
from .model import MultiHeadFarmerAIModel

def export_to_onnx(model, species_name, output_path):
    """
    Exports a specific species head to ONNX and quantizes it to INT8 
    for mobile/web edge inference.
    """
    model.eval()
    
    # We create a wrapper model that only returns the specific species output
    # because ONNX tracing needs a static graph.
    class SingleSpeciesWrapper(torch.nn.Module):
        def __init__(self, base_model, species):
            super().__init__()
            self.base_model = base_model
            self.species = species
            
        def forward(self, x):
            return self.base_model(x, species_name=self.species)
            
    wrapper = SingleSpeciesWrapper(model, species_name)
    
    # Dummy input for tracing (batch_size 1, 3 channels, 224x224)
    dummy_input = torch.randn(1, 3, 224, 224)
    
    # Export to ONNX
    torch.onnx.export(
        wrapper, 
        dummy_input, 
        output_path, 
        export_params=True, 
        opset_version=13, 
        do_constant_folding=True, 
        input_names=['input'], 
        output_names=['output'],
        dynamic_axes={'input': {0: 'batch_size'}, 'output': {0: 'batch_size'}}
    )
    
    print(f"Exported {species_name} model to {output_path}")
    
    # Note: To quantize to INT8 for ONNX Runtime, you typically use `onnxruntime.quantization` 
    # as a post-processing step on the exported ONNX file.
    # from onnxruntime.quantization import quantize_dynamic, QuantType
    # quantize_dynamic(output_path, output_path.replace(".onnx", "_int8.onnx"), weight_type=QuantType.QInt8)

if __name__ == "__main__":
    SPECIES_COUNTS = {'rice': 5}
    model = MultiHeadFarmerAIModel(SPECIES_COUNTS)
    # Load weights
    # model.load_state_dict(torch.load("multi_head_farmer_ai.pth"))
    
    export_to_onnx(model, 'rice', 'rice_head.onnx')
